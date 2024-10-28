from ironpdf import *
import google.generativeai as genai
from pathlib import Path
import os
import re
import json
from dotenv import load_dotenv

load_dotenv()
source_folder = "C:/Users/a21ma/OneDrive/Desktop/Code/Projects/MeDocs (Health Records Startup)/"


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
    model_name="gemini-1.0-pro-vision-latest",
    generation_config=vision_generation_config,
    safety_settings=safety_settings,
)

text_model = genai.GenerativeModel(
    model_name="gemini-1.0-pro",
    generation_config=text_generation_config,
    safety_settings=safety_settings,
)


def pdf_to_images(pdf_path):
    pdf = PdfDocument.FromFile(pdf_path)
    # Extract all pages to a folder as image files
    pdf.RasterizeToImageFiles(f"{source_folder}MeDocs/backend/uploaded_images/*.png",DPI=96)

# pdf_path = "test3pdf.pdf"
# pdf_to_images(pdf_path)

def images_to_text():
    # Path to the images folder
    images_folder = f"{source_folder}MeDocs/backend/uploaded_images"
    response_list = []

    # Iterate through each image file in the folder
    for filename in os.listdir(images_folder):
        if filename.endswith((".png", ".jpeg", ".jpg")):
            image_path = os.path.join(images_folder, filename)
            
            # Validate that an image is present
            if not (img := Path(image_path)).exists():
                raise FileNotFoundError(f"Could not find image: {img}")

            image_parts = [
            {
                "mime_type": "image/jpeg",
                "data": Path(image_path).read_bytes()
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
            # print(response.text)
            response_list.append(vision_response.text)

    # Now response1 contains the descriptions of all the images processed
    return response_list


def data_extraction():
    
    text_images = images_to_text()

    date = ""
    report_temp = [] # temporary list of images in one report
    reports = [] # list of all reports -> this will be sent to report database

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
        
        # match = re.search(r"{(.*)}", llm_response.text, flags=re.DOTALL)
        # extracted_content = match.group(1)
        # json_object = json.loads("{" + extracted_content + "}")
        
        if llm_response.text != 'None':
            if llm_response.text == date:
                previous_image = report_temp[i-1] if i-1 >= 0 else 'None'
                prompt = [
                    f"""
                    Text 1: {text_images[i]}
                    Text 2: {previous_image}
                    
                    You are a smart bot that compares parts of reports and decided whether they are of the same report or not.
                    Figure out whether the Text 1 and Text 2 given above are parts of the same report or talking about the same report.
                    If you think they are part of the same report, then output "True". If you think they are not part of the same report, output "False".
                    If Text 2 above is given as "None" then automatically give output as "True".
                    
                    GIVE OUTPUT ONLY AS "True" OR "False"
                    """
                ]
                llm_response2 = text_model.generate_content(prompt)
                print(llm_response2.text)
                
                if llm_response2.text == "True": # same context i.e. same report
                    report_temp.append(text_images[i])
                
                elif llm_response2.text == "False": # different context i.e. not same report
                    reports.append(report_temp)
                    report_temp = []
                    report_temp.append(text_images[i])
                
                else:
                    print("Error: LLM could not process context correctly")
                
            else:
                reports.append(report_temp)
                report_temp = []
                report_temp.append(text_images[i])
                date = llm_response.text
                
                
        elif llm_response.text == 'None':
            report_temp.append(text_images[i])
    
    reports.append(report_temp)
    
    json_report = {f"Report{i+1}": report for i, report in enumerate(reports[1:])}
    
    report_json = json.dumps(json_report, indent=4)
    
    return report_json
            
reports = data_extraction()

print(reports)