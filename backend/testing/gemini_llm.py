import os
from dotenv import load_dotenv
from langchain_google_genai import ChatGoogleGenerativeAI

# Load environment variables from .env file
load_dotenv()

# Check if the API key is already set in the environment
if "GOOGLE_API_KEY" not in os.environ:
    raise ValueError("GOOGLE_API_KEY not found in environment or .env file")

api_key = os.environ["GOOGLE_API_KEY"]

llm = ChatGoogleGenerativeAI(model="gemini-pro")
result = llm.invoke("hi there! how are you?")
print(result.content)