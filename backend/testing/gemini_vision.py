from pathlib import Path
import google.generativeai as genai
import os
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

# Check if the API key is already set in the environment
if "GOOGLE_API_KEY" not in os.environ:
    raise ValueError("GOOGLE_API_KEY not found in environment or .env file")

genai.configure(api_key=os.environ["GOOGLE_API_KEY"])

image_path = "test2.jpeg"

# Set up the model
generation_config = {
  "temperature": 0.4,
  "top_p": 1,
  "top_k": 32,
  "max_output_tokens": 4096,
}

safety_settings = [
  {
    "category": "HARM_CATEGORY_HARASSMENT",
    "threshold": "BLOCK_MEDIUM_AND_ABOVE"
  },
  {
    "category": "HARM_CATEGORY_HATE_SPEECH",
    "threshold": "BLOCK_MEDIUM_AND_ABOVE"
  },
  {
    "category": "HARM_CATEGORY_SEXUALLY_EXPLICIT",
    "threshold": "BLOCK_MEDIUM_AND_ABOVE"
  },
  {
    "category": "HARM_CATEGORY_DANGEROUS_CONTENT",
    "threshold": "BLOCK_MEDIUM_AND_ABOVE"
  },
]

model = genai.GenerativeModel(model_name="gemini-pro-vision",
                              generation_config=generation_config,
                              safety_settings=safety_settings)

# Validate that an image is present
if not (img := Path(image_path)).exists():
  raise FileNotFoundError(f"Could not find image: {img}")

image_parts = [
  {
    "mime_type": "image/jpeg",
    "data": Path(image_path).read_bytes()
  },
]

prompt_parts = [
  image_parts[0],
  '''
  You have 2 tasks:
  1. Extract the accurate date given in the image. MAKE SURE THE DATE IS ACCURATE, THE DATE IS THE MOST IMPORTANT PART OF THE TASK. 
  2. Write a short summary of the text given in the image. Make sure to specify the name of the patient and what diseases he is suffering from. Also specify other details given in the image like the medicines prescribed and other details of the patient and doctor.
  
  Give your output in a json STRICTLY in this format:
  {
    "date": "DD|MM|YYYY",
    "name": "Name of the patient",
    "diseases": "Diseases the patient is suffering from",
    "medicines": "Medicines prescribed to the patient, if any (if none, write 'None')",
    "doctor": "Name of the doctor, if given. If not given write 'None'",
    "summary": "The rest of the information given in the image",
    
  }
  ''',
]

response = model.generate_content(prompt_parts)
print(response.text)