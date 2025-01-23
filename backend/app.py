from fastapi import FastAPI, File, Form, Query, UploadFile, HTTPException, Request
from fastapi.responses import JSONResponse, HTMLResponse
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from starlette.middleware.sessions import SessionMiddleware
from starlette.middleware.base import BaseHTTPMiddleware
from utils import process_image, process_pdf, llm_model, llm_calendar_response
from calendar_task import add_event, delete_event_by_name
from pydantic import BaseModel, EmailStr
from typing import List, Dict, Optional
import json
import ast
import uuid
from datetime import datetime
import qrcode
import chromadb
import chromadb.utils.embedding_functions as embedding_functions
import os
from dotenv import load_dotenv
from cryptography.fernet import Fernet
load_dotenv()


CHROMADB_PATH = os.getenv("CHROMADB_PATH")
MAX_CHAT_HISTORY_LENGTH = 5

chromadb_client = chromadb.PersistentClient(path=CHROMADB_PATH)
embedding_function = embedding_functions.SentenceTransformerEmbeddingFunction(model_name="thenlper/gte-base")

reports_collection = chromadb_client.get_or_create_collection(name="reports", embedding_function=embedding_function) # If not specified, by default uses the embedding function "all-MiniLM-L6-v2"
users_collection = chromadb_client.get_or_create_collection(name="users", embedding_function=embedding_function) # If not specified, by default uses the embedding function "all-MiniLM-L6-v2"
doctor_collection = chromadb_client.get_or_create_collection(name="doctors", embedding_function=embedding_function)

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
qr_codes_folder = os.path.join(source_folder, "backend/qr_codes")
os.makedirs(uploaded_pdfs_folder, exist_ok=True)
os.makedirs(uploaded_images_folder, exist_ok=True)
os.makedirs(qr_codes_folder, exist_ok=True)

app.mount("/api/uploaded_pdfs", StaticFiles(directory=uploaded_pdfs_folder), name="uploaded_pdfs")
app.mount("/api/uploaded_images", StaticFiles(directory=uploaded_images_folder), name="uploaded_images")
app.mount("/api/qr_codes", StaticFiles(directory=qr_codes_folder), name="qr_codes")
    
class GoogleLoginModel(BaseModel):
    email: EmailStr
    name: str


class UserResponse(BaseModel):
    user_id: str
    email: str
    name: str
    phone_number: str
    owner_address: str


@app.get("/api", response_class=HTMLResponse)
async def index(request: Request):
    
    return "Welcome to the Medocs Backend"


@app.post("/api/google_login")
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
    
@app.post("/api/doctor_google_login")
async def google_login(data: GoogleLoginModel):
    email = data.email
    print(data)

    try:
        # Check if the user already exists
        
        user = doctor_collection.get(
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
            # Register the doctor
            user_data = {
                "user_id": str(uuid.uuid4()),
                "email": data.email,
                "name": data.name,
                "shared_reports": "[]",
                "chat_history": "[]"
            }
            
            doctor_collection.add(
                documents=[str(user_data)],
                metadatas={"email": user_data["email"], "name": user_data["name"], "shared_reports": user_data["shared_reports"], "chat_history": user_data["chat_history"]},
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

class ShareReportRequest(BaseModel):
    user_id: str
    reportId: str
    email: str

@app.post("/api/share_report")
async def api_share_report(request: ShareReportRequest):
    print(request)  # Log the received request to see what is being sent
    report_share = reports_collection.get(ids=[request.reportId])
    print()
    print("Report Shared:")
    print(report_share)  # Log the fetched report share
    
    
    # Add the report ID to the doctor's shared_reports metadata
    doctor = doctor_collection.get(where={"email": request.email})
    if doctor["metadatas"]:
        shared_reports_str = doctor["metadatas"][0].get("shared_reports", "[]")
        shared_reports = json.loads(shared_reports_str)
        
        # Check if the report is already shared
        if not any(report["report_id"] == request.reportId for report in shared_reports):
            # Append the new report with empty notes
            shared_reports.append({"report_id": request.reportId, "notes": ""})
            
            # Convert the updated list back to a JSON string
            updated_shared_reports_str = json.dumps(shared_reports)
            
            # Update the doctor's collection with the new shared report
            doctor_collection.update(
                ids=doctor["ids"],
                metadatas={"shared_reports": updated_shared_reports_str}
            )
        else:
            print(f"Report {request.reportId} is already shared.")
        
    else:
        raise HTTPException(status_code=404, detail="Doctor not found")
    return {"status": "success", "data": report_share}

        

@app.post("/api/process_file")
async def api_process_file(file: UploadFile = File(...), user_id: str = Form(...), pet_id: Optional[str] = Form(None)):
    if not file.filename:
        raise HTTPException(status_code=400, detail="No file selected")

    if not file.filename.lower().endswith((".png", ".jpg", ".jpeg", ".gif", ".pdf")):
        raise HTTPException(status_code=400, detail="Unsupported file format")
    
    
    # integer_ids = []
    # for report in report_metadata:
    #     if report["report_id"].isdigit():
    #         integer_ids.append(int(report["report_id"]))
            
    # if integer_ids:
    #     next_id = str(max(integer_ids) + 1)
    # else:
    #     next_id = "1"  # Start from 1 if no IDs exist
    Json_object = {}
    
    if file.filename.lower().endswith(".pdf"):

        filename = os.path.join(uploaded_pdfs_folder, file.filename)
        with open(filename, "wb") as f:
            f.write(await file.read())

        json_object, reports, pdf_files = process_pdf(file.filename)
        print(len(reports), "reports found")
  
        # Initialize the index for pdf_files
        
        i=0
        # Loop through each report in the json_object
        for key in json_object:
            # Ensure we don't exceed the pdf_files length
            if i < len(pdf_files):
                link = pdf_files[i]
                i += 1  
                link=link.replace("/app/backend", "")
                link=f"http://purrytails.in/api{link}"
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
            Json_object[f"Report{i}"] = report_dict

            reports_collection.add(
            documents=[str(report_dict)],  # Convert report_dict to string if necessary
            metadatas={
                "report_id": report_id,
                "user_id": str(user_id),
                "pet_id": str(pet_id),
                "date": report_dict["date"],
                "report": report_dict["document"]
            },
            ids=[report_id]
        )
           
        
    i=0
    if file.filename.lower().endswith((".png", ".jpg", ".jpeg", ".gif")):

        filename = os.path.join(uploaded_images_folder, file.filename)
        with open(filename, "wb") as f:
            f.write(await file.read())
            
        link = f"http://purrytails.in/api/uploaded_images/{file.filename}"
            
        json_object, report = process_image(filename)
        
        report_id = str(uuid.uuid4())
        json_object["link"] = link
        json_object["report_id"] = report_id
        reports_collection.add(
            documents=[str(json_object)],
            metadatas={"report_id": report_id, "user_id": str(user_id), "pet_id": str(pet_id), "date": str(json_object["date"]), "report": str(report)},
            ids=[report_id]
        )
        Json_object[f"Report{i}"] = json_object

    print("#############################") 
    print("#############################")   
    print(Json_object)
    print("#############################")  
    print("#############################")  
    return JSONResponse(content=Json_object)



@app.post("/api/llm_chatbot")
async def llm_chatbot(request: Request):
    data = await request.json()
    input_string = data.get('message')
    user_id = data.get('user_id')
    pet_id = data.get('pet_id', None)
    user_type = data.get('user_type')
    feedback = data.get('feedback', None)

    # Retrieve existing chat history from the session (or database)
    if user_type == "doctor":
        user_metadata = doctor_collection.get(
            ids=[user_id],
            include=["metadatas"],
        )["metadatas"][0]
    
    elif user_type == "patient":
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

@app.get("/api/user_dashboard/{user_id}", response_model=UserResponse)
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

        
class ReportResponse(BaseModel):
    report_id: str
    patient_name: str
    report_data: str
    doctor_note: str
           
@app.get("/api/doctor_dashboard/{doctor_id}")
async def fetch_reports_for_doctor(doctor_id: str) -> List[ReportResponse]:
    # Fetch doctor data based on doctor_id
    doctor = doctor_collection.get(ids=[doctor_id], include=["metadatas"])
    if not doctor:
        raise HTTPException(status_code=404, detail="Doctor not found")
    
    print(doctor)

    # Extract and split the comma-separated report IDs
    shared_reports_str = doctor["metadatas"][0].get("shared_reports", "[]")
    print(shared_reports_str)
    if not shared_reports_str:
        return []

    shared_reports = json.loads(shared_reports_str)
    report_ids = [report["report_id"] for report in shared_reports]
    doctor_notes = [report["notes"] for report in shared_reports]

    # Fetch reports matching the report_ids
    # reports = reports_collection.get(where={"report_id": {"$in": report_ids}}, include=["documents", "metadatas"])
    
    reports = reports_collection.get(ids=report_ids, include=["documents", "metadatas"])
    
    print(reports)
    
    reports_metadata = reports["metadatas"]
    reports_ids = reports["ids"]
    reports = reports["documents"]
    
    patient_ids = [report_metadata["user_id"] for report_metadata in reports_metadata]
    
    patient_names = []
    
    for patient_id in patient_ids:
        print(patient_id)
        patient = users_collection.get(
            ids=[patient_id],
            include=["metadatas"]
        )
        print("*******************************")
        print(patient)
        patient_names.append(patient["metadatas"][0]["name"])
    
    for report, report_metadata in zip(reports, reports_metadata):
        print("############################")
        print(report)
        print(report_metadata["report_id"])
    
    report_list = [
        ReportResponse(report_id=report_id, patient_name=patient_name, report_data=report, doctor_note=doctor_note)
        for report, patient_name, report_id, doctor_note in zip(reports, patient_names, reports_ids, doctor_notes)
    ]

    return report_list

        
@app.get("/api/reports_dashboard/{user_id}")
async def get_reports(user_id: str, pet_id: Optional[str] = Query(None)):

    print(user_id)
    try:
        
        reports = reports_collection.get(
            include=["documents", "metadatas"],
            where={"$and": [{"user_id": user_id}, {"pet_id": pet_id}]}
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


@app.delete("/api/delete_report/{report_id}")
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

@app.delete("/api/doctor_delete_report")
async def doctor_delete_report(report_id: str, user_id: str):
    print(f"Deleting report {report_id} for user {user_id}")
    
    try:
        # Fetch the doctor's data by user_id
        doctor_data = doctor_collection.get(ids=[user_id], include=["metadatas"])
        print(f"Doctor Data: {doctor_data}")
        
        if not doctor_data or "shared_reports" not in doctor_data["metadatas"][0]:
            raise HTTPException(status_code=404, detail="No reports found for the specified user")

        # Retrieve the shared reports (stored as a JSON string)
        shared_reports_str = doctor_data["metadatas"][0]["shared_reports"]
        print(f"Shared Reports (String): {shared_reports_str}")
        
        # Parse the JSON string into a Python list
        shared_reports = json.loads(shared_reports_str)
        print(f"Shared Reports (Parsed): {shared_reports}")
        
        # Check if the report exists in the list and remove it
        updated_reports = [report for report in shared_reports if report["report_id"] != report_id]
        
        if len(updated_reports) == len(shared_reports):
            raise HTTPException(status_code=404, detail="Report ID not found in shared reports")
        
        # Convert the updated list back to a JSON string
        updated_shared_reports_str = json.dumps(updated_reports)
        print(f"Updated Shared Reports (String): {updated_shared_reports_str}")
        
        # Update the doctor's collection with the modified shared reports list
        doctor_collection.update(
            ids=[user_id],
            metadatas={"shared_reports": updated_shared_reports_str}
        )

        return {"status": "success", "message": "Report deleted successfully"}

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to delete report: {str(e)}")



key = os.getenv("FERNET_KEY")
if not key:
    raise ValueError("No Fernet key found in environment variables")

cipher_suite = Fernet(key)


class DecryptRequest(BaseModel):
    data: str 

@app.post("/api/decrypt")
async def decrypt_data(request: DecryptRequest):
    print(request.data)
    try:
        # Decrypt the data using Fernet
        decrypted_data = cipher_suite.decrypt(request.data.encode()).decode()
        print(decrypted_data)
        
        # Return the decrypted data, assumed to be a URL or something to navigate to
        return decrypted_data
    except Exception as e:
        raise HTTPException(
            status_code=400,
            detail={"status": False, "message": f"Decryption Failed: {str(e)}"},
        )
    
@app.post("/api/generate_qr_code/{user_id}")
async def generate_qr_code(user_id: str):
    try:
        # Generate QR code
        qr = qrcode.QRCode(
            version=1,
            error_correction=qrcode.constants.ERROR_CORRECT_L,
            box_size=10,
            border=4,
        )
        
        qr_data = f"http://localhost:3000/qr_dashboard/{user_id}" 
        encrypted_qr_data = cipher_suite.encrypt(qr_data.encode()).decode()
        print(encrypted_qr_data)
        qr.add_data(encrypted_qr_data)
        qr.make(fit=True)

        

        # Create the image
        img = qr.make_image(fill="black", back_color="white")

        qr_image_path = os.path.join(qr_codes_folder, f"{user_id}.png")
        img.save(qr_image_path)

        # Generate the URL for the QR code
        qr_code_link = f"http://localhost:5000/qr_codes/{user_id}.png"

        return JSONResponse(content={"status": True, "qr_code_link": qr_code_link})

    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail={"status": False, "message": f"Failed to generate QR code: {str(e)}"},
        )
          
 
class UpdateReportDateRequest(BaseModel):
    new_date: str
              
@app.put("/api/update_report_date/{report_id}")
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
    
    
@app.post("/api/calendar_request")
async def calendar_request(request: Request):
    data = await request.json()
    print(data)
    
    input_text = data["text"]
    # access_token = data["access_token"]
    # refresh_token = data.get("refresh_token", None)
    user_id = data["user_id"]
    
    # service = authenticate(access_token, refresh_token)
    
    # response = llm_calendar_response(input_text, service, user_id)
    response = llm_calendar_response(input_text, user_id)
    
    return {"status": "success", "message": response}


@app.post("/api/create_event_directly")
async def create_event(event_data: dict):
    # access_token = event_data["access_token"]
    event_name = event_data["title"]
    start_datetime = event_data["start"]
    end_datetime = event_data["end"]
    user_id = event_data["user_id"]  # Assuming user_id is passed to identify the user

    # service = authenticate(access_token)
    # response = add_event(service, event_name, start_datetime, end_datetime=end_datetime, user_id=user_id)
    response = add_event(event_name, start_datetime, end_datetime=end_datetime, user_id=user_id)
    
    return {"status": "success", "message": response}

    
@app.delete("/api/delete_event")
async def delete_event(event_data: dict):

    # access_token = event_data["access_token"]
    event_name = event_data["event_name"]
    user_id = event_data["user_id"]
    
    # service = authenticate(access_token)
    # delete_event_by_name(service, event_name, user_id)
    delete_event_by_name(event_name, user_id)


    return {"message": "Event deleted successfully."}


@app.get("/api/get_user_events/{user_id}")
async def get_user_events(user_id: str):
    user_metadata = users_collection.get(ids=[user_id], include=["metadatas"])["metadatas"][0]
    
    if user_metadata:
        events = user_metadata["events"]
        print(events)
        return events
    return []



class SaveDoctorNotesRequest(BaseModel):
    report_id: str
    doctor_id: str
    notes: str

@app.post("/api/save_doctor_notes")
async def save_doctor_notes(request: SaveDoctorNotesRequest):
    try:
        # Fetch doctor's record from the collection by doctor_id
        doctor_data = doctor_collection.get(ids=[request.doctor_id], include=["metadatas"])
        
        if not doctor_data or "shared_reports" not in doctor_data["metadatas"][0]:
            raise HTTPException(status_code=404, detail="No shared reports found for the specified doctor")

        # Retrieve shared reports as a JSON string and parse it into a list of JSON objects
        shared_reports_str = doctor_data["metadatas"][0]["shared_reports"]
        shared_reports = json.loads(shared_reports_str)

        # Find the report in shared_reports and update its notes
        report_found = False
        for report in shared_reports:
            if report["report_id"] == request.report_id:
                report["notes"] = request.notes
                report_found = True
                break
        
        if not report_found:
            raise HTTPException(status_code=404, detail="Report ID not found in shared reports")

        # Convert the updated shared reports back to a JSON string
        updated_shared_reports_str = json.dumps(shared_reports)

        # Update the doctor's collection with the updated shared reports
        doctor_collection.update(
            ids=[request.doctor_id],
            metadatas={"shared_reports": updated_shared_reports_str}
        )

        return {"status": "success", "message": "Notes saved successfully"}

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to save notes: {str(e)}")
    
    
           
# @app.post("/send_meeting_invite")
# async def send_meeting_invite(meeting_request: dict):
#     try:
#         email = meeting_request["email"]
#         access_token = meeting_request["access_token"]
        
#         service = authenticate(access_token)
#         # Step 1: Create the Google Meet link
#         meet_link = create_google_meet_event(service, email)

#         # Step 2: Send the link via email to the provided doctor email
#         send_email(email, meet_link)

#         return {"message": "Google Meet invite sent successfully", "meet_link": meet_link}
#     except Exception as e:
#         raise HTTPException(status_code=500, detail=f"Error sending invite: {str(e)}")
    

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

    


@app.get("/api/chats/{user_id}")
async def chats(user_id: str):
    print(user_id)
    user = users_collection.get(ids=[user_id])
    user_metadata = user["metadatas"][0]
    if "chats" in user_metadata:
        chats = user_metadata["chats"]
        return chats
    else:
        return []
    

@app.post("/api/start_chat")
async def start_chat(data: dict):
    user_id = data.get("user_id")
    email = data.get("email")
    # Logic to add a new chat (mock or database operation)
    # Example: Update the user's chat list in the database
    try:
        user = users_collection.get(ids=[user_id])
        user_metadata = user["metadatas"][0]
        if "chats" in user_metadata:
            chats = json.loads(user_metadata["chats"])
        else:
            chats = {}
        chats[email] = []
        users_collection.update(
            ids=[user_id],
            metadatas={"chats": json.dumps(chats)}
        )
        
        return {"message": "Chat added successfully!"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to add chat: {str(e)}")   


@app.get("/api/messages/{user_id}/{email}")
def get_messages_by_user_and_name(user_id: str, email: str):
    user = users_collection.get(ids=[user_id])
    user_metadata = user["metadatas"][0]
    if "chats" in user_metadata:
        chats = json.loads(user_metadata["chats"])
        if email in chats:
            messages = chats[email]
            return messages
    else:
        return []
    return messages


class SentMessage(BaseModel):
    user_id: str
    email: str
    message: str
    
@app.post("/api/send_chat")
def send_chat(data: SentMessage):
    user_id = data.user_id
    receiver_email = data.email
    message = data.message
    
    user = users_collection.get(ids=[user_id])
    user_metadata = user["metadatas"][0]
    sender_email = user_metadata["email"]
    sender_chats = json.loads(user_metadata["chats"])
    
    sender_message = {"sender": "you", "content": message}
    receiver_message = {"sender": "them", "content": message}
    
    try:  
        receiver = users_collection.get(where={"email": receiver_email})
        receiver_metadata = receiver["metadatas"][0]
        receiver_id = receiver["ids"][0]
        print(receiver_id)
        if "chats" in receiver_metadata:
            receiver_chats = json.loads(receiver_metadata["chats"])
        else:
            receiver_chats = {}
            receiver_chats[sender_email] = []
        if sender_email in receiver_chats:
            messages = receiver_chats[sender_email]
            messages.append(receiver_message)
            receiver_chats[sender_email] = messages
            users_collection.update(
                ids=[receiver_id],
                metadatas={"chats": json.dumps(receiver_chats)}
            )
        
    except:
        raise HTTPException(status_code=404, detail="Receiver is not registered")
    
    
    if receiver_email in sender_chats:
        messages = sender_chats[receiver_email]
        messages.append(sender_message)
        sender_chats[receiver_email] = messages
        users_collection.update(
            ids=[user_id],
            metadatas={"chats": json.dumps(sender_chats)}
        )
    
    
    return "done"

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=5000)