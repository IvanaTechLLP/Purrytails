import datetime
from google.auth.transport.requests import Request
from google.oauth2.credentials import Credentials
from googleapiclient.discovery import build
from googleapiclient.errors import HttpError

import chromadb
import chromadb.utils.embedding_functions as embedding_functions
import uuid
import json
import os
from dotenv import load_dotenv
load_dotenv()

CHROMADB_PATH = os.getenv("CHROMADB_PATH")

chromadb_client = chromadb.PersistentClient(path=CHROMADB_PATH)
embedding_function = embedding_functions.SentenceTransformerEmbeddingFunction(model_name="thenlper/gte-base")

reports_collection = chromadb_client.get_or_create_collection(name="reports", embedding_function=embedding_function) # If not specified, by default uses the embedding function "all-MiniLM-L6-v2"
users_collection = chromadb_client.get_or_create_collection(name="users", embedding_function=embedding_function) # If not specified, by default uses the embedding function "all-MiniLM-L6-v2"
doctor_collection = chromadb_client.get_or_create_collection(name="doctors", embedding_function=embedding_function)



# If modifying these scopes, delete the file token.json.
# SCOPES = ["https://www.googleapis.com/auth/calendar"]  # Required for event creation

"""
Shows basic usage of the Google Calendar API.

- Prints the start and name of the next 10 events on the user's calendar (top_ten function).
- Adds a new event to the Google calendar with specified details (add_event function).
"""


# def authenticate(access_token, refresh_token=None):
#     """Authenticates the user and returns the Calendar API service object."""

#     creds = Credentials(
#         token=access_token,
#         refresh_token=refresh_token,
#         token_uri="https://oauth2.googleapis.com/token",
#         client_id=os.getenv("GOOGLE_CLIENT_ID"),
#         client_secret=os.getenv("GOOGLE_CLIENT_SECRET"),
#         scopes=SCOPES,
#     )
    
#     # Refresh the token if it is expired
#     if creds.expired and creds.refresh_token:
#         creds.refresh(Request())
#     # The file token.json stores the user's access and refresh tokens, and is
#     # created automatically when the authorization flow completes for the first
#     # time.
#     # Create the Google Calendar API service
#     service = build("calendar", "v3", credentials=creds)
#     return service



def add_event(event_name, start_datetime, end_datetime=None, is_all_day=False, location=None, recurrence = "does not repeat", user_id=None):
    """
    Adds a new event to the user's Google calendar.

    Args:
        service: The Google Calendar API service object.
        event_name (str): The name of the event.
        start_datetime (str): The start date and time of the event in ISO 8601 format (e.g., 2024-03-31T10:00:00Z).
        end_datetime (str, optional): The end date and time of the event in ISO 8601 format. Defaults to None (same as start_datetime).
        is_all_day (bool, optional): Whether the event is an all-day event. Defaults to False.
        location (str, optional): The location of the event. Defaults to None.
    """

    event = {"summary": event_name}

    if is_all_day:
        event["start"] = {"date": start_datetime.split("T")[0]}  # Extract date for all-day events
        event["end"] = {"date": (datetime.datetime.strptime(start_datetime, "%Y-%m-%dT%H:%M:%SZ") + datetime.timedelta(days=1)).strftime("%Y-%m-%d")}  # Set end date to the next day
    else:
        event["start"] = {"dateTime": start_datetime}
        if end_datetime:
            event["end"] = {"dateTime": end_datetime}

    # Add location if provided
    if location:
        event["location"] = location

    # Set "recurrence" to 'does not repeat' (this is the default behavior, but added for clarity)
    event["recurrence"] = recurrence

    try:
        # Add the event to Google Calendar
        # event = service.events().insert(calendarId="primary", body=event).execute()
        # print(f"Event created: {event.get('htmlLink')}")

        # Store event in user's metadata in users_collection
        user_metadata = users_collection.get(ids=[user_id], include=["metadatas"])["metadatas"][0]

        if user_metadata:
            events = json.loads(user_metadata["events"])
            events.append({
                "event_name": event_name,
                "start_datetime": start_datetime,
                "end_datetime": end_datetime,
                "location": location,
                "event_id": str(uuid.uuid4())
            })
            users_collection.update(
                ids=[user_id],
                metadatas={"events": json.dumps(events)}
            )
    except HttpError as error:
        print(f"An error occurred: {error}")


def delete_event_by_name(event_name, user_id):
    """
    Deletes an event from the user's Google Calendar based on the event name.

    Args:
        service: The Google Calendar API service object.
        event_name (str): The name of the event to be deleted.
        
    It also deletes the event from our local chromadb database.
    """
    
    user_metadata = users_collection.get(ids=[user_id], include=["metadatas"])["metadatas"][0]
    events = json.loads(user_metadata["events"])
    
    for event in events:
        if event["event_name"] == event_name:
            events.remove(event)
            break
        
        
    users_collection.update(
        ids=[user_id],
        metadatas={"events": json.dumps(events)}
    )
    
    
    print("Event deleted successfully.")

    # try:
    #     now = datetime.datetime.utcnow().isoformat() + "Z"  # 'Z' indicates UTC time
    #     events_result = (
    #         service.events()
    #         .list(
    #             calendarId="primary",
    #             timeMin=now,
    #             maxResults=10,
    #             singleEvents=True,
    #             orderBy="startTime",
    #         )
    #         .execute()
    #     )
    #     events = events_result.get("items", [])

    #     # Find the event to delete by its name
    #     event_to_delete = None
    #     for event in events:
    #         if event.get("summary") == event_name:
    #             event_to_delete = event
    #             break

    #     if event_to_delete is None:
    #         print("Event not found.")
    #         return

    #     # Call the delete API to remove the event
    #     service.events().delete(calendarId='primary', eventId=event_to_delete['id']).execute()
        
        

    # except HttpError as error:
    #     print(f"An error occurred: {error}")


def update_event(event_name, new_event_name=None, new_start_datetime=None, new_end_datetime=None, new_location = None, new_recurrence = None):
  try:
        # now = datetime.datetime.utcnow().isoformat() + "Z"  # 'Z' indicates UTC time
        # events_result = (
        #     service.events()
        #     .list(
        #         calendarId="primary",
        #         timeMin=now,
        #         maxResults=10,
        #         singleEvents=True,
        #         orderBy="startTime",
        #     )
        #     .execute()
        # )
        # events = events_result.get("items", [])

        # Find the event by its name
        # for event in events:
        #     if event.get("summary") == event_name:
        #         # Extract event details
        #         event_name = event.get("summary")
        #         # print("event name: ",event_name)
        #         if not new_event_name:
        #           new_event_name = event.get("summary")
        #           print("new event name: ",new_event_name)
        #         if not new_start_datetime:
        #           new_start_datetime = event["start"].get("dateTime")
        #         if not new_end_datetime:
        #           new_end_datetime = event["end"].get("dateTime")
        #         if not new_location:
        #           new_location = event.get("location")
        #         if not new_recurrence:
        #           new_recurrence = event.get("recurrence")
        
        delete_event_by_name(event_name)
        add_event(new_event_name, new_start_datetime, new_end_datetime, location=new_location)

        return None

  except HttpError as error:
      print(f"An error occurred: {error}")
      return None
  

# if __name__ == "__main__":
#     service = authenticate()


