import chromadb
import chromadb.utils.embedding_functions as embedding_functions

from langchain_huggingface import HuggingFaceEmbeddings
from langchain_chroma import Chroma

import json
import os
import ast

CHROMADB_PATH = "chromadb_database"
MAX_CHAT_HISTORY_LENGTH = 5

chromadb_client = chromadb.PersistentClient(path=CHROMADB_PATH)
embedding_function = embedding_functions.SentenceTransformerEmbeddingFunction(model_name="thenlper/gte-base")
embeddings = HuggingFaceEmbeddings(model_name="thenlper/gte-base")

reports_collection = chromadb_client.get_or_create_collection(name="reports", embedding_function=embedding_function) # If not specified, by default uses the embedding function "all-MiniLM-L6-v2"
users_collection = chromadb_client.get_or_create_collection(name="users", embedding_function=embedding_function) # If not specified, by default uses the embedding function "all-MiniLM-L6-v2"
doctor_collection = chromadb_client.get_or_create_collection(name="doctors", embedding_function=embedding_function)

reports_vector_store = Chroma(
    client=chromadb_client,
    collection_name="reports",
    embedding_function=embeddings,
)

source_folder = "/app"

print(users_collection.count())