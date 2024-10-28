from pathlib import Path
import os
from dotenv import load_dotenv
import google.generativeai as genai
from PIL import Image
from fpdf import FPDF
from datetime import datetime

load_dotenv()


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


def images_to_text(new_folder_path):
    # Path to the images folder
    images_folder = os.path.join(source_folder,"MeDocs/backend/uploaded_images",new_folder_path)
    response_list = []

    # Iterate through each image file in the folder
    for filename in os.listdir(images_folder):
        if filename.endswith(".png"):
            image_path = os.path.join(images_folder, filename)
            
            # Validate that an image is present
            if not (img := Path(image_path)).exists():
                raise FileNotFoundError(f"Could not find image: {img}")
            
            image_data=Path(image_path).read_bytes()
            image_parts = [
            {
                "mime_type": "image/png",
                "data": image_data
            },
            ]

            prompt = [
                """
                Read all the data given data in the image. Output the data in a string format.
                """,
                image_parts[0],
            ]
            
            # Describe the image using Gemini Vision
            vision_response = vision_model.generate_content(prompt)
            # print(vision_response.parts)
            if not vision_response.parts:
                response_list.append("Empty Image")
            else:
                response_list.append(vision_response.text)

    # Now response1 contains the descriptions of all the images processed
    return response_list


def data_extraction(new_folder_path,new_folder):
    
    text_images = images_to_text(new_folder_path)

    date = ""
    report_temp = []  # temporary list of images (with index) in one report
    reports = []  # list of all reports (with their corresponding image indices)
    report_dates = []  # list of dates of all reports
    

    for i in range(len(text_images)):
        
        prompt = [
            f"""
            Text to be considered:{text_images[i]}
            
            Extract the accurate date given in the above text. MAKE SURE THE DATE IS ACCURATE, THE DATE IS THE MOST IMPORTANT PART OF THE TASK. IF DATE IS NOT GIVEN MAKE SURE YOU WRITE IT AS 'None'. 
            
            Give your output STRICTLY in this format: "DD|MM|YYYY"
            """
        ]
        llm_response = text_model.generate_content(prompt)
        print(llm_response.text)
        
        if llm_response.text != 'None':
            if llm_response.text == date:
                report_dates.append(llm_response.text)
                previous_image = report_temp[-1]['text'] if i-1 >= 0 else 'None'

                prompt = [
                        f"""
                            Text 1: {text_images[i]}
                            Text 2: {previous_image}
                            
                            You are a sophisticated bot designed to determine if two segments of text, Text 1 and Text 2, are parts of the same medical report or prescription. Please follow these detailed rules to make your assessment:

                            1. **Header and Document Type Comparison**:
                                - Check if Text 1 and Text 2 share the same header (e.g., doctor’s name, clinic name).
                                - If both texts have the same header and are a "medical report" then output "True."
                                - If both texts have the same header and are a "medical prescription" then checking of the date and context becomes very essential, proceed to the next checks.
                                - If either text lacks a header, output "True."
                                - If the headers differ, proceed to the next checks.

                            2. **Date and Time Analysis**:
                                - Examine the dates in both texts. If the dates match it indicates they may belong to the same report or prescription.

                            3. **Context and Medical Terminology Evaluation**:
                                - Analyze the context of both texts for medical relevance. Look for common medical terms, diagnoses, or procedures. If the texts discuss similar medical issues or treatments, this suggests they are related.
                                - Pay attention to typical prescription language, such as "Dosage," "Refills," or specific medication names. If such terms are present in both texts, this strengthens the case for them being part of the same prescription.

                            4. **Keyword and Similarity Assessment**:
                                - Extract key medical terms or phrases from both texts. A significant overlap in keywords (e.g., medication names, conditions) indicates a connection.
                                - Assess the similarity of the content. If Text 1 and Text 2 are semantically similar, output "True."

                            5. **Special Case for Text 2**:
                                - If Text 2 is "None," automatically output "True."

                            6. **Output Format**:
                                - Your output should strictly be "True" or "False" based on the assessments above. If there is a high degree of certainty based on the rules, indicate this in the reasoning behind the output.
                        """
                    ]


                llm_response2 = text_model.generate_content(prompt)
                print(llm_response2.text)
                
                if llm_response2.text == "True":  # same context i.e. same report
                    report_temp.append({'text': text_images[i], 'index': i})
                
                elif llm_response2.text == "False":  # different context i.e. not same report
                    reports.append(report_temp)
                    report_temp = [{'text': text_images[i], 'index': i}]
                
                else:
                    print("Error: LLM could not process context correctly")
                
            else:
                reports.append(report_temp)
                report_temp = [{'text': text_images[i], 'index': i}]
                date = llm_response.text
                report_dates.append(llm_response.text)
                
        elif llm_response.text == 'None':
            report_temp.append({'text': text_images[i], 'index': i})
            if date != "":
                report_dates.append(date)
            else:
                report_dates.append('None')

    reports.append(report_temp)

    # Create a JSON-like dictionary with report indices and dates
    json_reports = {
        f"Report{i+1}": {
            "date": date, 
            "report": [img['text'] for img in report],
            "image_indices": [img['index'] for img in report]
        }
        for i, (date, report) in enumerate(zip(report_dates, reports[1:]))
    }
    image_paths = create_pdfs_from_reports(new_folder, json_reports)
    return json_reports, report_dates,image_paths

def create_pdfs_from_reports(folder_path, reports_data):

    all_image_paths = []  # List to store image paths for all reports
    
    for report_name, report_info in reports_data.items():
        date = report_info['date']
        image_indices = report_info['image_indices']

    
        # Initialize PDF
        pdf = FPDF()
        pdf.set_auto_page_break(auto=True, margin=15)
        
        for idx in image_indices:     
            image_path = os.path.join(r"backend\uploaded_images", f"pdf_{folder_path}\\image{idx}.png")

            
            if os.path.exists(image_path):
                all_image_paths.append(image_path)  # Collecting image paths
                
                # Open the image to get its dimensions
                img = Image.open(image_path)
                img_width, img_height = img.size

                # Convert dimensions to match the PDF page size
                aspect_ratio = img_height / img_width
                pdf_width = 210  # A4 width in mm
                pdf_height = pdf_width * aspect_ratio  # Scale height to maintain aspect ratio

                pdf.add_page()
                pdf.image(image_path, x=0, y=0, w=pdf_width, h=pdf_height)
            else:
                print(f"Image not found: {image_path}")
        
        # Save the PDF with the report name and date
        pdf_output_path = os.path.join(r"backend\uploaded_images", f"pdf_{folder_path}\\pdf{idx}.pdf")

        pdf.output(pdf_output_path)
        print(f"Saved PDF: {pdf_output_path}")
        
        all_image_paths.append(pdf_output_path)

    return all_image_paths  # Returning the list of image paths used

