import chromadb
import chromadb.utils.embedding_functions as embedding_functions

from langchain_huggingface import HuggingFaceEmbeddings
from langchain_chroma import Chroma

import json
import os
import ast
from collections import defaultdict

CHROMADB_PATH = "chromadb_database"
MAX_CHAT_HISTORY_LENGTH = 5

chromadb_client = chromadb.PersistentClient(path=CHROMADB_PATH)
embedding_function = embedding_functions.SentenceTransformerEmbeddingFunction(model_name="thenlper/gte-base")
embeddings = HuggingFaceEmbeddings(model_name="thenlper/gte-base")

reports_collection = chromadb_client.get_or_create_collection(name="reports", embedding_function=embedding_function)
users_collection = chromadb_client.get_or_create_collection(name="users", embedding_function=embedding_function)
doctor_collection = chromadb_client.get_or_create_collection(name="doctors", embedding_function=embedding_function)

reports_vector_store = Chroma(
    client=chromadb_client,
    collection_name="reports",
    embedding_function=embeddings,
)

source_folder = "/app"

print(f"Total users: {users_collection.count()}\n")

# Extract user details
users_data = users_collection.get()
user_info = {}
for doc in users_data["documents"]:
    user_dict = ast.literal_eval(doc)
    user_info[user_dict["email"]] = {
        "name": user_dict["name"],
        "email": user_dict["email"],
        "user_id": user_dict["user_id"],
        "report_count": 0  # Initialize report count
    }

# Count reports per user
report_metadata = reports_collection.get()["metadatas"]
report_count = defaultdict(int)

for metadata in report_metadata:
    if "user_id" in metadata:
        report_count[metadata["user_id"]] += 1

# Update report count in user_info
for user in user_info.values():
    user["report_count"] = report_count.get(user["user_id"], 0)

# Print the results
print("\nUser Report Counts:")
for user in user_info.values():
    print(f"{user['name']} ({user['email']}): {user['report_count']} reports")

# Print total number of reports
print("\nTotal reports in collection:", reports_collection.count())
