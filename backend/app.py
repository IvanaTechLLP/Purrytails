from fastapi import FastAPI, File, Form, Query, UploadFile, HTTPException, Request
from fastapi.responses import JSONResponse, HTMLResponse
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from starlette.middleware.sessions import SessionMiddleware
from starlette.middleware.base import BaseHTTPMiddleware
from utils import process_image, process_pdf, llm_model
from pydantic import BaseModel, EmailStr
from typing import List, Optional
import json
import ast
import uuid
import chromadb
import chromadb.utils.embedding_functions as embedding_functions
import os
from dotenv import load_dotenv
load_dotenv()


CHROMADB_PATH = os.getenv("CHROMADB_PATH")
MAX_CHAT_HISTORY_LENGTH = 5

chromadb_client = chromadb.PersistentClient(path=CHROMADB_PATH)
embedding_function = embedding_functions.SentenceTransformerEmbeddingFunction(model_name="thenlper/gte-base")

reports_collection = chromadb_client.get_or_create_collection(name="reports", embedding_function=embedding_function) # If not specified, by default uses the embedding function "all-MiniLM-L6-v2"
users_collection = chromadb_client.get_or_create_collection(name="users", embedding_function=embedding_function) # If not specified, by default uses the embedding function "all-MiniLM-L6-v2"

source_folder = os.getenv("SOURCE_FOLDER")

app = FastAPI()


origins = [
    "http://localhost",
    "http://localhost:3000",
    "*",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],  # Allow all methods (GET, POST, etc.)
    allow_headers=["*"],  # Allow all headers
)

app.add_middleware(SessionMiddleware, secret_key=os.getenv("SESSION_SECRET_KEY"))

class CustomMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request, call_next):
        response = await call_next(request)
        response.headers["Cross-Origin-Opener-Policy"] = "same-origin"
        response.headers["Cross-Origin-Embedder-Policy"] = "require-corp"
        return response

app.add_middleware(CustomMiddleware)

uploaded_pdfs_folder = os.path.join(source_folder, "backend/uploaded_pdfs")
uploaded_images_folder = os.path.join(source_folder, "backend/uploaded_images")
os.makedirs(uploaded_pdfs_folder, exist_ok=True)
os.makedirs(uploaded_images_folder, exist_ok=True)

app.mount("/uploaded_pdfs", StaticFiles(directory=uploaded_pdfs_folder), name="uploaded_pdfs")
app.mount("/uploaded_images", StaticFiles(directory=uploaded_images_folder), name="uploaded_images")
    
class GoogleLoginModel(BaseModel):
    email: EmailStr
    name: str


class UserResponse(BaseModel):
    user_id: str
    email: str
    name: str
    phone_number: str
    owner_address: str


@app.get("/", response_class=HTMLResponse)
async def index(request: Request):
    
    return "Welcome to the Medocs Backend"


@app.post("/google_login")
async def google_login(data: GoogleLoginModel):
    email = data.email
    print(data)

    try:
        # Check if the user already exists
        
        user = users_collection.get(
            include=["metadatas"],
            where={"email": email}
        )
        
        
    except Exception as e:
        user = None
    
    try:

        if user["metadatas"]:
            # User already exists, log them in
            print(user)
            return {
                "status": True,
                "message": "Login Successful",
                "data": {
                    "user_id": user["ids"][0],
                    "email": user["metadatas"][0]["email"],
                    "name": user["metadatas"][0]["name"],
                },
            }
            
        else:
            # Register the user
            user_data = {
                "user_id": str(uuid.uuid4()),
                "email": data.email,
                "name": data.name
            }
            
            users_collection.add(
                documents=[str(user_data)],
                metadatas={"email": user_data["email"], "name": user_data["name"], "events": "[]", "pet_details": "[]"},
                ids=[user_data["user_id"]]
            )

            return {
                "status": True,
                "message": "Registration Successful",
                "data": {
                    "user_id": user_data["user_id"],
                    "email": user_data["email"],
                    "name": user_data["name"],
                },
            }

    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail={"status": False, "message": f"Failed to process request: {str(e)}"},
        )
    

@app.post("/api/process_file")
async def api_process_file(files: List[UploadFile] = File(...), user_id: str = Form(...), pet_id: Optional[str] = Form(None)):
    
    if not files:
        raise HTTPException(status_code=400, detail="No files selected")

    Json_object = {}
    
    for i, file in enumerate(files):
        if not file.filename:
            continue

        filename_lower = file.filename.lower()

        if filename_lower.endswith((".png", ".jpg", ".jpeg", ".gif")):
            filename = os.path.join(uploaded_images_folder, file.filename)
            with open(filename, "wb") as f:
                f.write(await file.read())

            link = f"http://localhost:5000/uploaded_images/{file.filename}"
            json_object, report = process_image(filename)

            report_id = str(uuid.uuid4())
            json_object["link"] = link
            json_object["report_id"] = report_id

            reports_collection.add(
                documents=[str(json_object)],
                metadatas={
                    "report_id": report_id,
                    "user_id": str(user_id),
                    "pet_id": str(pet_id),
                    "date": str(json_object["date"]),
                    "report": str(report)
                },
                ids=[report_id]
            )

            Json_object[f"ImageReport{i}"] = json_object

        elif filename_lower.endswith(".pdf"):
            filename = os.path.join(uploaded_pdfs_folder, file.filename)
            with open(filename, "wb") as f:
                f.write(await file.read())

            json_object, reports, pdf_files = process_pdf(file.filename)
            print(len(reports), "reports found")

            for j, key in enumerate(json_object):
                if j < len(pdf_files):
                    link = pdf_files[j].replace("backend\\", "")
                    link = f"http://localhost:5000/{link}"
                    
                    report_id = str(uuid.uuid4())
                    report_dict = {
                        "link": link,
                        "report_id": report_id,
                        "date": json_object[key]["date"],
                        "document": json_object[key]["document"],
                        "diseases": json_object[key]["diseases"],
                        "medicines": json_object[key]["medicines"],
                        "doctor": json_object[key]["doctor"],
                        "summary": json_object[key]["summary"],
                        "overview": json_object[key]["overview"],
                        "domain": json_object[key]["domain"]
                    }

                    reports_collection.add(
                        documents=[str(report_dict)],
                        metadatas={
                            "report_id": report_id,
                            "user_id": str(user_id),
                            "pet_id": str(pet_id),
                            "date": report_dict["date"],
                            "report": report_dict["document"]
                        },
                        ids=[report_id]
                    )

                    Json_object[f"PDFReport{i}_{j}"] = report_dict

    return JSONResponse(content=Json_object)



@app.post("/llm_chatbot")
async def llm_chatbot(request: Request):
    data = await request.json()
    input_string = data.get('message')
    user_id = data.get('user_id')
    pet_id = data.get('pet_id', None)
    user_type = data.get('user_type')
    feedback = data.get('feedback', None)

    
    if user_type == "patient":
        user_metadata = users_collection.get(
            ids=[user_id],
            include=["metadatas"],
        )["metadatas"][0]
        
    else:
        raise ValueError("Invalid user type")
    
    user_metadata["chat_history"] = user_metadata.get("chat_history", "[]")
    
    
    chat_history = ast.literal_eval(user_metadata["chat_history"])

    # Limit the conversation history to the last `max_history_length` messages
    if len(chat_history) > MAX_CHAT_HISTORY_LENGTH:
        chat_history = chat_history[-MAX_CHAT_HISTORY_LENGTH:]
    
    if feedback == "negative":
        chat_history = []
        
    # Append the new message to the history
    chat_history.append({"role": "user", "content": input_string})

    # Concatenate chat history and user input to send to the LLM
    conversation = "\n".join([f"{msg['role']}: {msg['content']}" for msg in chat_history])

    # Generate response using the LLM, including the conversation history
    response_text, relevant_reports = llm_model(input_string, conversation, user_id, user_type, pet_id)
        
    print()
    print()
    print("######################################################################")
    print(relevant_reports)


    # Add the assistant's response to the chat history
    chat_history.append({"role": "assistant", "content": response_text})
    
    users_collection.update(
        ids=[user_id],
        metadatas={"chat_history": str(chat_history)},
    )
    
    # Save updated chat history back to the session (or database)
    print()
    print("Chat History:")
    print(chat_history)

    return JSONResponse(content={"response": response_text, "relevant_reports": relevant_reports})

@app.get("/user_dashboard/{user_id}", response_model=UserResponse)
async def get_user_details(user_id: str):
    print(user_id)
    try:
        
        user = users_collection.get(
            ids=[user_id],
            include=["documents", "metadatas"],
        )

        try:
            user_details = user["documents"][0]
            user_metadata = user["metadatas"][0]
            user_details = user_details.replace("'", "\"")
            user_details = json.loads(user_details)
            user_details["phone_number"] = user_metadata.get("phone_number", "")
            user_details["owner_address"] = user_metadata.get("owner_address", "")
            user_details["name"] = user_metadata.get("name", "")
            
        except:
            user_details = None
        
        return JSONResponse(content=user_details)

    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail={"status": False, "message": f"Failed to fetch user details: {str(e)}"},
        )
        
        
@app.post("/api/update_user_details/{user_id}")
async def update_user_details(user_id: str, data: dict):
    try:
        # Fetch the user's record from the collection by user_id
        user = users_collection.get(ids=[user_id], include=["metadatas"])
        user_metadata = user["metadatas"][0]
        user_metadata["phone_number"] = data["userDetails"].get("phone_number", user_metadata["phone_number"])
        user_metadata["owner_address"] = data["userDetails"].get("owner_address", user_metadata["owner_address"])
        user_metadata["name"] = data["userDetails"].get("name", user_metadata["name"])
        
        if not user["ids"]:
            raise HTTPException(status_code=404, detail="User not found")
        
        # Update the user's metadata with the new details
        users_collection.update(
            ids=[user_id],
            metadatas=user_metadata
        )

        return {"status": "success", "message": "User details updated successfully"}

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to update user details: {str(e)}")


@app.get("/reports_dashboard/{user_id}")
async def get_reports(user_id: str, pet_id: Optional[str] = Query(None)):
    print(user_id)
    try:
        
        reports = reports_collection.get(
            include=["documents", "metadatas"],
            # where={"$and": [{"user_id": user_id}, {"pet_id": pet_id}]}
            where={"pet_id": pet_id}
        )
        

        ids = reports["ids"]
        reports = reports["documents"]
                
        json_reports = []
        for report, id in zip(reports, ids):
            print(report)
            report = ast.literal_eval(report)
            report["id"] = id
            json_reports.append(report)
            
        # json_reports.sort(key=lambda x: x["date"])
        print(json_reports)
            
        if not reports:
            raise HTTPException(status_code=404, detail="No reports found")
        
        return JSONResponse(content=json_reports)
            

    except Exception as e:
        print(str(e))
        raise HTTPException(
            status_code=500,
            detail={"status": False, "message": f"Failed to fetch reports: {str(e)}"},
        )


@app.delete("/delete_report/{report_id}")
async def delete_report(report_id: str):
    try:
        # Fetch the report by its report_id
        reports_to_delete = reports_collection.get(
            where={"report_id": report_id}
        )

        if not reports_to_delete["ids"]:
            raise HTTPException(status_code=404, detail="Report not found")

        # Delete the report by its ID
        reports_collection.delete(ids=reports_to_delete["ids"])

        return {"status": "success", "message": "Report deleted successfully"}

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to delete report: {str(e)}")

 
class UpdateReportDateRequest(BaseModel):
    new_date: str
              
@app.put("/update_report_date/{report_id}")
async def update_report_date(report_id: str, request: UpdateReportDateRequest):
    try:
        # Fetch the report to update using the report_id
        reports_to_update = reports_collection.get(where={"report_id": report_id}, include=["documents"])
        
        if not reports_to_update["ids"]:
            raise HTTPException(status_code=404, detail="Report not found")
        
        report_doc = ast.literal_eval(reports_to_update["documents"][0])
        report_doc["date"] = request.new_date
        
        # Update the report's date
        reports_collection.update(
            ids=reports_to_update["ids"],
            metadatas={"date": request.new_date},
            documents=[str(report_doc)]
        )
        
        return {"status": "success", "message": "Report date updated successfully"}

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to update report date: {str(e)}")
    
    
class PetDetails(BaseModel):
    user_id: str
    petDetails: dict
        
@app.post("/api/store_pet_details")
async def store_pet_details(data: PetDetails):
    try:
        # Extract data from request
        user_id = data.user_id
        pet_details = data.petDetails
        
        owner_address = pet_details.get("ownerAddress", "")
        print(owner_address)
        pet_details.pop("ownerAddress")
        phone_number = pet_details.get("phoneNumber", "")
        print(phone_number)
        pet_details.pop("phoneNumber")
        
        pet_details["petId"] = str(uuid.uuid4())
        
        user = users_collection.get(ids=[user_id])
        user_metadata = user["metadatas"][0]
        
        existing_pet_details = json.loads(user_metadata.get("pet_details", "[]"))
        existing_pet_details.append(pet_details)
        
        final_metadatas = {"pet_details": json.dumps(existing_pet_details)}
        if owner_address != "":
            final_metadatas["owner_address"] = owner_address
        if phone_number != "":
            final_metadatas["phone_number"] = phone_number

        # Store data in ChromaDB under the user's ID
        users_collection.update(
            ids=[user_id],  # Unique identifier for the user
            metadatas=final_metadatas,  # Metadata contains the pet details
        )

        return {"message": "Pet details saved successfully in ChromaDB!"}

    except Exception as e:
        print(f"Error storing pet details: {e}")
        raise HTTPException(status_code=500, detail="An error occurred while saving data.")
    
    
@app.post("/api/update_pet_details")
async def update_pet_details(data: PetDetails):
    try:
        # Extract data from request
        user_id = data.user_id
        pet_details = data.petDetails
        
        pet_id = pet_details["petId"]
        
        user = users_collection.get(ids=[user_id])
        user_metadata = user["metadatas"][0]
        
        existing_pet_details = json.loads(user_metadata.get("pet_details", "[]"))
        
        for i, pet in enumerate(existing_pet_details):
            if pet["petId"] == pet_id:
                existing_pet_details[i] = pet_details
                break
        
        final_metadatas = {"pet_details": json.dumps(existing_pet_details)}

        # Store data in ChromaDB under the user's ID
        users_collection.update(
            ids=[user_id],  # Unique identifier for the user
            metadatas=final_metadatas,  # Metadata contains the pet details
        )

        return {"message": "Pet details updated successfully in ChromaDB!"}

    except Exception as e:
        print(f"Error updating pet details: {e}")
        raise HTTPException(status_code=500, detail="An error occurred while updating data.")
    

@app.get("/api/get_pet_details/{user_id}")
async def get_pet_details(user_id: str):
    try:
        print(user_id)
        user = users_collection.get(ids=[user_id])
        # print(user)
        user_metadata = user["metadatas"][0]
        # print(user_metadata)
        
        pet_details = user_metadata.get("pet_details", {})
        owner_address = user_metadata.get("owner_address", "")
        phone_number = user_metadata.get("phone_number", "")
        
        return {"pet_details": json.loads(pet_details), "owner_address": owner_address, "phone_number": phone_number}
    except Exception as e:
        print(f"Error fetching pet details: {e}")
        raise HTTPException(status_code=500, detail="An error occurred while fetching data.")


@app.post("/api/delete_pet_details")
async def delete_pet_details(data: dict):
    try:
        # Extract data from request
        user_id = data["user_id"]
        pet_id = data["pet_id"]
        
        
        user = users_collection.get(ids=[user_id])
        user_metadata = user["metadatas"][0]
        
        existing_pet_details = json.loads(user_metadata.get("pet_details", "[]"))
        
        updated_pet_details = [pet for pet in existing_pet_details if pet["petId"] != pet_id]
        
        final_metadatas = {"pet_details": json.dumps(updated_pet_details)}

        # Store data in ChromaDB under the user's ID
        users_collection.update(
            ids=[user_id],  # Unique identifier for the user
            metadatas=final_metadatas,  # Metadata contains the pet details
        )

        return {"message": "Pet details deleted successfully in ChromaDB!"}

    except Exception as e:
        print(f"Error deleting pet details: {e}")
        raise HTTPException(status_code=500, detail="An error occurred while deleting data.")
    
    
@app.post("/api/share_pet_profile")   
async def share_pet_profile(data: dict):
    try:
        user_id = data["user_id"]  # ID of the current user
        email = data["email"]  # Email of the target user
        pet_id = data["pet_id"]  # ID of the pet to transfer
        
        # Get the current user data
        current_user = users_collection.get(ids=[user_id])
        if not current_user or not current_user.get("metadatas"):
            raise HTTPException(status_code=404, detail="Current user not found")
        current_user_metadata = current_user["metadatas"][0]
        current_user_email = current_user_metadata.get("email")  # Fetch sender's email
        
        # Get the target user by email
        target_user = users_collection.get(include=["metadatas"], where={"email": email})
        if not target_user or not target_user.get("ids"):
            raise HTTPException(status_code=404, detail="Target user not found")

        target_user_id = target_user["ids"][0]
        target_user_metadata = target_user["metadatas"][0]

        # Get pet details from the current user
        current_pet_details = json.loads(current_user_metadata.get("pet_details", "[]"))
        pet_to_transfer = None
        updated_pet_details = []

        for pet in current_pet_details:
            if pet["petId"] == pet_id:
                pet_to_transfer = pet
            else:
                updated_pet_details.append(pet)

        if not pet_to_transfer:
            raise HTTPException(status_code=404, detail="Pet not found for the current user")

        # Add sender email to the pet before transferring
        pet_to_transfer["sender"] = current_user_email
        
        # If the sender is Darsh, add document paths
        if current_user_email == "darshtakkar09@gmail.com":
            pet_to_transfer["documents"] = [
                "backend/documents/🐾 DOGGY DON’TS! 🚫.pdf.pdf",
                "backend/documents/Big Dog Diet.pdf",
                "backend/documents/DOGGY DON’TS!.pdf",
                "backend/documents/Toilet Training Guide .pdf"
            ]
        
        # Update the current user's pet details (remove the transferred pet)
        current_user_metadata["pet_details"] = json.dumps(updated_pet_details)
        users_collection.update(ids=[user_id], metadatas=[current_user_metadata])

        # Add the pet to the target user's pet details
        target_pet_details = json.loads(target_user_metadata.get("pet_details", "[]"))
        target_pet_details.append(pet_to_transfer)
        target_user_metadata["pet_details"] = json.dumps(target_pet_details)

        # Update the target user's metadata
        users_collection.update(ids=[target_user_id], metadatas=[target_user_metadata])

        return {"message": "Pet profile successfully transferred!"}
        
    except Exception as e:
        print(f"Error transferring pet profile: {e}")
        raise HTTPException(status_code=500, detail="An error occurred while transferring the pet profile.")


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=5000)