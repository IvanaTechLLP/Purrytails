import json
import re
import ast
import google.generativeai as genai
import fitz
from pdf_data_extractor import data_extraction
from calendar_task import add_event, delete_event_by_name, update_event
import chromadb
import chromadb.utils.embedding_functions as embedding_functions
from langchain_huggingface import HuggingFaceEmbeddings
from langchain_chroma import Chroma
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
import os
from datetime import datetime, timedelta
from dotenv import load_dotenv
load_dotenv()

CHROMADB_PATH = os.getenv("CHROMADB_PATH")

chromadb_client = chromadb.PersistentClient(path=CHROMADB_PATH)
embedding_function = embedding_functions.SentenceTransformerEmbeddingFunction(model_name="thenlper/gte-base")
langchain_embedding_function = HuggingFaceEmbeddings(model_name="thenlper/gte-base")

reports_collection = chromadb_client.get_or_create_collection(name="reports", embedding_function=embedding_function) # If not specified, by default uses the embedding function "all-MiniLM-L6-v2"
users_collection = chromadb_client.get_or_create_collection(name="users", embedding_function=embedding_function) # If not specified, by default uses the embedding function "all-MiniLM-L6-v2"
doctor_collection = chromadb_client.get_or_create_collection(name="doctors", embedding_function=embedding_function) # If not specified, by default uses the embedding function "all-MiniLM-L6-v2"

reports_vector_store = Chroma(
    client=chromadb_client,
    collection_name="reports",
    embedding_function=langchain_embedding_function,
)

SMTP_SERVER = "smtp.gmail.com"
SMTP_PORT = 587
SMTP_USER = os.getenv("SMTP_USER")  # Meddocs Gmail address
SMTP_PASSWORD = os.getenv("SMTP_PASSWORD")  # Medocs Gmail App password

no_of_reports = reports_collection.count()

if "GOOGLE_API_KEY" not in os.environ:
    raise ValueError("GOOGLE_API_KEY not found in environment or .env file")

genai.configure(api_key=os.environ["GOOGLE_API_KEY"])

# Set up the model
vision_generation_config = {
    "temperature": 0.4,
    "top_p": 1,
    "top_k": 32,
    "max_output_tokens": 4096,
}

text_generation_config = {
    "temperature": 0.9,
    "top_p": 1,
    "top_k": 1,
    "max_output_tokens": 2048,
}

safety_settings = [
    {"category": "HARM_CATEGORY_HARASSMENT", "threshold": "BLOCK_MEDIUM_AND_ABOVE"},
    {"category": "HARM_CATEGORY_HATE_SPEECH", "threshold": "BLOCK_MEDIUM_AND_ABOVE"},
    {
        "category": "HARM_CATEGORY_SEXUALLY_EXPLICIT",
        "threshold": "BLOCK_MEDIUM_AND_ABOVE",
    },
    {
        "category": "HARM_CATEGORY_DANGEROUS_CONTENT",
        "threshold": "BLOCK_MEDIUM_AND_ABOVE",
    },
]

vision_model = genai.GenerativeModel(
    model_name="gemini-1.5-flash",
    generation_config=vision_generation_config,
    safety_settings=safety_settings,
)

text_model = genai.GenerativeModel(
    model_name="gemini-1.0-pro",
    generation_config=text_generation_config,
    safety_settings=safety_settings,
)

source_folder = os.getenv("SOURCE_FOLDER")


def process_image(filepath):

    
    
    file = genai.upload_file(path=filepath, mime_type="image/jpeg")

    prompt1 = """
        You have 2 tasks:
        1. Extract the accurate date given in the image. MAKE SURE THE DATE IS ACCURATE, THE DATE IS THE MOST IMPORTANT PART OF THE TASK. Identify and extract the accurate date from the following veterinary document. The date could appear in various formats (e.g., DD/MM/YYYY, MM/DD/YYYY, Month Day, Year, etc.), so ensure to capture it correctly regardless of the format used. IF IT IS NOT GIVEN MAKE SURE YOU WRITE IT AS 'NONE'. 
        2. Write a short summary of the text given in the image. Make sure to specify the diseases or conditions the pet is suffering from. Also, specify other details given in the image like the medicines prescribed.

        Give your output STRICTLY in this format:
        {
        "date": "Extract the date from the veterinary document. The date may be handwritten and can appear in various formats, such as DD/MM/YYYY, DD-MM-YYYY, MM/DD/YYYY, DD/MM/YY, or even written in words (e.g., 1st January 2023). UNDERSTAND WHICH TYPE HAS BEEN GIVEN AND EXTRACT ACCORDINGLY. IF IT IS DD/MM/YY format, convert via DD/MM/20YY. Ensure that the extracted date is strictly converted to the format DD/MM/YYYY. If the date is not present or if there are any errors in the extraction (e.g., illegible handwriting, incorrect format), return 'None'. Pay attention to the top half of the document, as dates are often found there. If none found give output as 'NONE'.",
        "document": "Classify the following veterinary document as either a prescription (includes veterinarian's name, prescribed medications, and dosage), a medical report (contains diagnostic results and pet analysis), or a medical bill (itemized list of services with costs and billing details).",
        "diseases": "Extract any symptoms or diseases mentioned in the following veterinary document. Look for common veterinary terms or descriptions related to the pet's condition, including specific diseases or symptoms such as 'fleas,' 'diarrhea,' 'vomiting,' or medical diagnoses. If not given, write 'None'.",
        "medicines": "Extract the names of any medicines mentioned in the following veterinary document, including prescribed drugs, dosages, and any related instructions for their use. If none, write 'None'.",
        "veterinarian": "Extract the name of the veterinarian mentioned in the following veterinary document, considering any titles (e.g., Dr., Vet.) and full name formats that may be used, if given. If not given, write 'None'.",
        "summary": "A short summary of the text given in the image. Make sure to specify the diseases or conditions the pet is suffering from. Also, specify other details given in the image like the medicines prescribed.",
        "domain": "Given the following veterinary report, determine which veterinary domain it belongs to based on the key medical information, symptoms, procedures, and terminology mentioned in the report. Use the domain descriptions below to match the report appropriately. In the output, provide both the domain name and a one-line description. Output for this attribute should be like 'domain': 'domain_name: description'. The possible domains are:

                    General Veterinary Medicine: Comprehensive care for animals and pets with various conditions.
                    Veterinary Surgery: Treatment of diseases, injuries, or deformities via operations in animals.
                    Veterinary Dermatology: Treatment of skin, hair, and fur-related disorders in animals.
                    Veterinary Neurology: Care for diseases of the nervous system (brain, spinal cord) in animals.
                    Veterinary Cardiology: Diagnosis and treatment of heart conditions in pets and animals.
                    Veterinary Oncology: Diagnosis and treatment of cancer in animals.
                    Veterinary Orthopedics: Care for conditions affecting the bones, joints, and muscles of animals.
                    Veterinary Radiology: Use of imaging technologies for diagnosis (X-ray, MRI, CT scans) in animals.
                    Veterinary Anesthesiology: Management of pain and anesthesia during surgeries in animals.
                    Veterinary Ophthalmology: Diagnosis and treatment of eye disorders in animals.
                    Veterinary ENT: Care for ear, nose, and throat conditions in pets and animals.
                    Veterinary Endocrinology: Focus on hormone-related diseases (e.g., diabetes, thyroid disorders) in animals.
                    Veterinary Nephrology: Care for kidney-related diseases and disorders in animals.
                    Veterinary Hematology: Diagnosis and treatment of blood disorders in animals.
                    Veterinary Pulmonology: Care for respiratory system diseases (lungs, airways) in animals.
                    Veterinary Gastroenterology: Treatment of digestive system conditions in animals.
                    Veterinary Pathology: Study of diseases through laboratory examination of tissues and fluids in animals.
                    Veterinary Immunology: Focus on immune system disorders and conditions in animals.
                    Veterinary Infectious Diseases: Diagnosis and treatment of infections in animals caused by bacteria, viruses, fungi, and parasites."
        }
       
        IF YOU DON'T FIND ANY OF THE ABOVE INFORMATION IN THE GIVEN IMAGE, WRITE 'None' IN ALL THE PLACES. DO NOT MAKE UP YOUR OWN INFORMATION.
    """


    response1 = vision_model.generate_content([file, prompt1])
    print(response1.text)
    match = re.search(r"{(.*)}", response1.text, flags=re.DOTALL)
    extracted_content = match.group(1)
    json_object = json.loads("{" + extracted_content + "}")

    extracted_date = json_object.get("date", None)
    print(f"Extracted Date: {extracted_date}")
    
    # Process the date if available
    if extracted_date and extracted_date != "NONE":
        try:
            # Handle the date format DD/MM/YYYY or adjust as needed
            cleaned_date = extracted_date.replace('|', '/')
            print(cleaned_date)
            date_obj = datetime.strptime(cleaned_date, '%d/%m/%Y')
            formatted_date = date_obj.strftime('%Y-%m-%d')  # Convert to 'YYYY-MM-DD'
            
            # Update the JSON object with the formatted date
            json_object['date'] = formatted_date
            print("Formatted Date:", formatted_date)
        except ValueError as e:
            print("Error parsing the date:", e)
            json_object['date'] = 'Invalid Date Format'
    else:
        json_object['date'] = 'None'
    
    prompt2 = """
        Read all the data given data in the image. Output the data in a string format.
        """
    
    response2 = vision_model.generate_content([file, prompt2])
    print("Image Reader Response: ", response2.text)
    
    return json_object, response2.text


def process_pdf(filename):
    # pdf = PdfDocument.FromFile(os.path.join("backend/uploaded_pdfs",filename))
    doc = fitz.open(os.path.join("backend/uploaded_pdfs",filename))
    
    uploaded_images_folder = os.path.join(source_folder, "backend/uploaded_images")
    os.makedirs(uploaded_images_folder, exist_ok=True)
    
    max_number = -1    
    # Iterate over the directories in the specified path
    for folder_name in os.listdir(os.path.join(source_folder,uploaded_images_folder)):
        if folder_name.startswith("pdf_"):
            # Extract the number after "pdf_"
            try:
                number = int(folder_name.split("pdf_")[1])
                # Update the maximum number if the extracted number is larger
                if number > max_number:
                    max_number = number
            except ValueError:
                # Skip if the folder name doesn't contain a valid number after "pdf_"
                continue

    # Store the maximum number found in a variable called new_folder
    new_folder = max_number+1 if max_number != -1 else 1


    # Extract all pages to a folder as image files
    # pdf.RasterizeToImageFiles(os.path.join(source_folder,f"backend/uploaded_images/pdf_{new_folder}","image*.png"),DPI=96)
    for i in range(doc.page_count):

        page = doc.load_page(i)

        pix = page.get_pixmap()
        
        folder_path = os.path.join(source_folder, "backend/uploaded_images", f"pdf_{new_folder}")
        os.makedirs(folder_path, exist_ok=True)

        image_path = os.path.join(source_folder,folder_path,f"image{i}.png")

        pix.save(image_path)
    doc.close()
    
    new_folder_path = os.path.join(source_folder,f"backend/uploaded_images/pdf_{new_folder}")
    reports_json,report_dates, image_path= data_extraction(new_folder_path,new_folder)
    
    print("##########################################################")
    print("Reports Json:")
    print(reports_json)
    print("##########################################################")
    pdf_files = [file for file in image_path if file.endswith('.pdf')]
    
    all_extracted_data = {}
    count = 1 
    for  report in reports_json.items():
        prompt1 = [
         """
        You have 2 tasks:
        1. Extract the accurate date given in the image. MAKE SURE THE DATE IS ACCURATE, THE DATE IS THE MOST IMPORTANT PART OF THE TASK. Identify and extract the accurate date from the following veterinary document. The date could appear in various formats (e.g., DD/MM/YYYY, MM/DD/YYYY, Month Day, Year, etc.), so ensure to capture it correctly regardless of the format used. IF IT IS NOT GIVEN MAKE SURE YOU WRITE IT AS 'NONE'. 
        2. Write a short summary of the text given in the image. Make sure to specify the diseases or conditions the pet is suffering from. Also, specify other details given in the image like the medicines prescribed.

        Give your output STRICTLY in this format:
        {
        "date": "Extract the date from the veterinary document. The date may be handwritten and can appear in various formats, such as DD/MM/YYYY, DD-MM-YYYY, MM/DD/YYYY, DD/MM/YY, or even written in words (e.g., 1st January 2023). UNDERSTAND WHICH TYPE HAS BEEN GIVEN AND EXTRACT ACCORDINGLY. IF IT IS DD/MM/YY format, convert via DD/MM/20YY. Ensure that the extracted date is strictly converted to the format DD/MM/YYYY. If the date is not present or if there are any errors in the extraction (e.g., illegible handwriting, incorrect format), return 'None'. Pay attention to the top half of the document, as dates are often found there. If none found give output as 'NONE'.",
        "document": "Classify the following veterinary document as either a prescription (includes veterinarian's name, prescribed medications, and dosage), a medical report (contains diagnostic results and pet analysis), or a medical bill (itemized list of services with costs and billing details).",
        "diseases": "Extract any symptoms or diseases mentioned in the following veterinary document. Look for common veterinary terms or descriptions related to the pet's condition, including specific diseases or symptoms such as 'fleas,' 'diarrhea,' 'vomiting,' or medical diagnoses. If not given, write 'None'.",
        "medicines": "Extract the names of any medicines mentioned in the following veterinary document, including prescribed drugs, dosages, and any related instructions for their use. If none, write 'None'.",
        "veterinarian": "Extract the name of the veterinarian mentioned in the following veterinary document, considering any titles (e.g., Dr., Vet.) and full name formats that may be used, if given. If not given, write 'None'.",
        "summary": "A short summary of the text given in the image. Make sure to specify the diseases or conditions the pet is suffering from. Also, specify other details given in the image like the medicines prescribed.",
        "domain": "Given the following veterinary report, determine which veterinary domain it belongs to based on the key medical information, symptoms, procedures, and terminology mentioned in the report. Use the domain descriptions below to match the report appropriately. In the output, provide both the domain name and a one-line description. Output for this attribute should be like 'domain': 'domain_name: description'. The possible domains are:

                    General Veterinary Medicine: Comprehensive care for animals and pets with various conditions.
                    Veterinary Surgery: Treatment of diseases, injuries, or deformities via operations in animals.
                    Veterinary Dermatology: Treatment of skin, hair, and fur-related disorders in animals.
                    Veterinary Neurology: Care for diseases of the nervous system (brain, spinal cord) in animals.
                    Veterinary Cardiology: Diagnosis and treatment of heart conditions in pets and animals.
                    Veterinary Oncology: Diagnosis and treatment of cancer in animals.
                    Veterinary Orthopedics: Care for conditions affecting the bones, joints, and muscles of animals.
                    Veterinary Radiology: Use of imaging technologies for diagnosis (X-ray, MRI, CT scans) in animals.
                    Veterinary Anesthesiology: Management of pain and anesthesia during surgeries in animals.
                    Veterinary Ophthalmology: Diagnosis and treatment of eye disorders in animals.
                    Veterinary ENT: Care for ear, nose, and throat conditions in pets and animals.
                    Veterinary Endocrinology: Focus on hormone-related diseases (e.g., diabetes, thyroid disorders) in animals.
                    Veterinary Nephrology: Care for kidney-related diseases and disorders in animals.
                    Veterinary Hematology: Diagnosis and treatment of blood disorders in animals.
                    Veterinary Pulmonology: Care for respiratory system diseases (lungs, airways) in animals.
                    Veterinary Gastroenterology: Treatment of digestive system conditions in animals.
                    Veterinary Pathology: Study of diseases through laboratory examination of tissues and fluids in animals.
                    Veterinary Immunology: Focus on immune system disorders and conditions in animals.
                    Veterinary Infectious Diseases: Diagnosis and treatment of infections in animals caused by bacteria, viruses, fungi, and parasites."
        }
       
        IF YOU DON'T FIND ANY OF THE ABOVE INFORMATION IN THE GIVEN IMAGE, WRITE 'None' IN ALL THE PLACES. DO NOT MAKE UP YOUR OWN INFORMATION.
  

            Given text:
            """,
            json.dumps(report)
            
        ]
        
        
        response1 = text_model.generate_content(prompt1)
        print(response1.text)
        match = re.search(r"{(.*)}", response1.text, flags=re.DOTALL)
        extracted_content = match.group(1)
        extracted_json_data = json.loads("{" + extracted_content + "}")
        extracted_date = extracted_json_data.get("date", None)
        print(f"Extracted Date: {extracted_date}")
        
        # Process the date if available
        if extracted_date and extracted_date != "NONE":
            try:
                # Handle the date format DD/MM/YYYY or adjust as needed
                cleaned_date = extracted_date.replace('|', '/')
                print(cleaned_date)
                try:
                    date_obj = datetime.strptime(cleaned_date, '%d/%m/%Y')
                except ValueError:
                    # If that fails, try the two-digit year format (yy)
                    date_obj = datetime.strptime(cleaned_date, '%d/%m/%y')
                formatted_date = date_obj.strftime('%Y-%m-%d')  # Convert to 'YYYY-MM-DD'
                
                # Update the JSON object with the formatted date
                extracted_json_data['date'] = formatted_date
                print("Formatted Date:", formatted_date)
            except ValueError as e:
                print("Error parsing the date:", e)
                extracted_json_data['date'] = 'Invalid Date Format'
        else:
            extracted_json_data['date'] = 'None'
        all_extracted_data[f"Report{count}"] = extracted_json_data
        count += 1  # Increment the counter for each report
        print("##########################################################")
        print("all_extracted_data:")
        print(all_extracted_data)
        print("##########################################################")
        print(pdf_files)
        print(type(all_extracted_data))
    return all_extracted_data, reports_json,pdf_files


def llm_model(input_string, conversation, user_id, user_type):
    print("Input String: ", input_string)
    # if input_string != None:
    prompt_parts = [
            f"""
            
            Here is the conversation you are having with the user so far: {conversation}
            
            You are a smart classifier bot for an application in which people upload their medical reports. You have to figure out whether the user is asking a question about the medical field or not. If the user is talking about or asking a question related to the medical field, output the string "Report" along with the content of the user's query (this content will be used as query_text to query reports in the chromadb database and fetch relevant reports).
            
            If the user is not talking about something related to the meidcal field, output "None". 
            
            Give output STRICTLY in the following format: "Report, <chromadb_query>" or "None"

            
            """
        ]
    
    classifier_response = text_model.generate_content(prompt_parts)
    print()
    print("Classifier Response")
    print(classifier_response.text)
    classification = classifier_response.text.split(",")[0]
        
    if classification == "None":
        
        prompt_parts = [
            f"""
            You are a helpful medical assistant chatbot that answer's the user's questions to the best of your ability accurately. Answer briefly and to the point unless the user asks for more details.Answer only in a string, dont add "assistant: " before your answer.
            Here is the user's question and your chat history with the user: {conversation}
            """
        ]
        
        response = text_model.generate_content(prompt_parts)
        print()
        print("Non Medical Response")
        print(response.text)
        
        return response.text, None
        
    elif classification == "Report":
        
        chromadb_query = classifier_response.text.split(",")[1]
        
        relevant_reports= []
         
        if "when" in input_string or "all" in input_string:
            print("Querying all reports")
            
            if user_type == "doctor":
                doctor_data = doctor_collection.get(
                    include=["documents", "metadatas"],
                    ids=[user_id]
                )
                
                shared_reports_data = doctor_data["metadatas"][0]["shared_reports"]
                doctor_report_ids = [report["report_id"] for report in shared_reports_data]
                
                reports = reports_collection.get(
                    include=["documents", "metadatas"],
                    ids=[doctor_report_ids]
                )
            
            elif user_type == "patient": 
                reports = reports_collection.get(
                    include=["documents", "metadatas"],
                    where={"user_id": user_id}
                )
                
            else:
                raise ValueError("Invalid user type")
                
            report_documents = reports["documents"]
            report_metadatas = reports["metadatas"]
                        
            for report, id in zip(report_documents, report_metadatas):
                report = ast.literal_eval(report)
                report["id"] = id["report_id"]
                relevant_reports.append(report)
                
            # relevant_reports.sort(key=lambda x: int(x["date"])) # sort by similarity score instead of date instead
     
        
        else:
            
            if user_type == "doctor":
                
                doctor_data = doctor_collection.get(
                    include=["documents", "metadatas"],
                    ids=[user_id]
                )
                print(doctor_data)
                shared_reports_data = json.loads(doctor_data["metadatas"][0]["shared_reports"])
                print(shared_reports_data)
                doctor_report_ids = [report["report_id"] for report in shared_reports_data]
                print(doctor_report_ids)
                
                results = reports_vector_store.similarity_search_with_score(
                    query=chromadb_query, k=no_of_reports, filter={"report_id": {
                        "$in": doctor_report_ids
                    }}
                )
                print(results)
                
            elif user_type == "patient": 
                results = reports_vector_store.similarity_search_with_score(
                    query=chromadb_query, k=no_of_reports, filter={"user_id": user_id}
                )
                
            else:
                raise ValueError("Invalid user type")

            if results and any(score < 0.4 for _, score in results):
                for res, score in results:
                    if score < 0.4:
                        json_report = ast.literal_eval(res.page_content)
                        json_report["id"] = res.metadata["report_id"]
                        relevant_reports.append(json_report)
            else:
                print("No results found.")

            # report = reports_collection.query(
            #     query_texts=[chromadb_query],
            #     n_results=1,
            #     include=["documents", "metadatas"],
            #     where={"user_id": user_id}
            # )
            # report_document = report["documents"][0][0]
            # report_metadata = report["metadatas"][0][0]
            
            # report = ast.literal_eval(report_document)
            # report["id"] = report_metadata["report_id"]
            # relevant_reports.append(report)


        if "when" in input_string:
            prompt_parts = [
                f"""
                You are a helpful chatbot that helps the user understand the data uploaded by the user himself by answering questions about the data that the user asks.
                You are chatting with the user who has uploaded the following medical reports: {relevant_reports}
                You should try and answer the questions as accurately and with as much detail as possible and as relevant to the data given as possible. Look for a date mentioned in the report, its most likely the date that the user visited the doctor and is now asking about.
                If you find a report that answers the user's question, also output the id of the report as the first character of your output string. Example: "1, <your answer>"
                
                If the user asks a question that cannot be answered by the given medical reports, respond with "This question cannot be answered by the data given in any of your medical reports". Answer only in a string, dont add "assistant: " before your answer.
                
                This is the question asked by the user along with your chat history with the user: {conversation}
                """
            ]    
            
            response = text_model.generate_content(prompt_parts)
            print()
            print("Response contained 'when'")
            print(response.text)
            
            id = response.text.split(",")[0]
            relevant_reports = report in relevant_reports if report["id"] == id else None
            
            
        else:
                        
            prompt_parts = [
                    f"""
                    You are a helpful chatbot that helps the user understand the data uploaded by the user himself by answering questions about the data that the user asks.
                    You are chatting with the user who has uploaded the following medical reports: {relevant_reports}
                    You should try and answer the questions as accurately and with as much detail as possible and as relevant to the data given as possible. Also, if there is a date mentioned in the report, its most likely the date that the user visited the doctor. If the user asks a question that cannot be answered by the given medical reports, respond with "This question cannot be answered by the data given in any of your medical reports". Answer only in a string, dont add "assistant: " before your answer.
                    
                    This is the question asked by the user along with your chat history with the user: {conversation}
                    """
                ]

            response = text_model.generate_content(prompt_parts)
            print()
            print("Response did not contain 'when'")
            print(response.text)
        
       
        
        return response.text, relevant_reports
    
    
def llm_calendar_response(input_string: str, service, user_id):
    prompt_parts = [
            f"""
            User's input: {input_string}
            You are a calendar manager bot that manages the user's Google Calendar.
            If user asks to edit their schedule (example: add or delete tasks for a day or hour, etc):
            identify task_type based on context: "create event", "delete event", "update event","check events"
            STRICT output format (separated by commas): "task_type identified above, event name identified above, start_datetime in YYYY-MM-DDTHH:MM:SSZ format in Indian Standard Time, end_datetime in YYYY-MM-DDTHH:MM:SSZ format in Indian Standard Time"
            
            if time not specified, assume full day event and take start time as 00:00:00 and end time as 23:59:59 of specified date

            """
        ]
    
    response = text_model.generate_content(prompt_parts)
    print(response.text)
    task_type = response.text.split(",")[0].strip()
    print(task_type)
    
    if task_type == "create event":
        event_name = response.text.split(",")[1].strip()
        start_datetime = response.text.split(",")[2].strip()
        end_datetime = response.text.split(",")[3].strip()
        
        add_event(service, event_name, start_datetime, end_datetime=end_datetime, user_id=user_id)
        print("Event added successfully")
        
        return "Event added successfully"

    elif task_type == "delete event":
        event_name = response.text.split(",")[1].strip()
        delete_event_by_name(service, event_name)
        
        return "Event deleted successfully"
    
    elif task_type == "update event":
        event_name = response.text.split(",")[1].strip()
        start_datetime = response.text.split(",")[2].strip()
        end_datetime = response.text.split(",")[3].strip()
        update_event(service, event_name, new_start_datetime=start_datetime, end_datetime=end_datetime)
        
        return "Event updated successfully"

    return response.text


def create_google_meet_event(service, doctor_email):

    # Define the event details
    event = {
        'summary': 'Google Meet with Doctor',
        'start': {
            'dateTime': (datetime.utcnow() + timedelta(minutes=10)).isoformat() + 'Z',
            'timeZone': 'UTC',
        },
        'end': {
            'dateTime': (datetime.utcnow() + timedelta(hours=1)).isoformat() + 'Z',
            'timeZone': 'UTC',
        },
        'conferenceData': {
            'createRequest': {
                'conferenceSolutionKey': {'type': 'hangoutsMeet'},
                'requestId': 'some-random-string',
            },
        },
        'attendees': [{'email': doctor_email}],
    }

    # Create the event in Google Calendar
    event = service.events().insert(
        calendarId='primary',
        body=event,
        conferenceDataVersion=1
    ).execute()

    return event.get('hangoutLink')



def send_email(to_email, meet_link):
    msg = MIMEMultipart()
    msg['From'] = SMTP_USER
    msg['To'] = to_email
    msg['Subject'] = 'Google Meet Invite'

    body = f"You are invited to a Google Meet. Join the meeting via this link: {meet_link}"
    msg.attach(MIMEText(body, 'plain'))

    with smtplib.SMTP(SMTP_SERVER, SMTP_PORT) as server:
        server.starttls()
        server.login(SMTP_USER, SMTP_PASSWORD)
        server.sendmail(SMTP_USER, to_email, msg.as_string())