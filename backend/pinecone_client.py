import os
from pinecone import Pinecone
from dotenv import load_dotenv

load_dotenv()

pc = Pinecone(api_key=os.getenv("PINECONE_API_KEY"))
index = pc.Index(os.getenv("PINECONE_INDEX_NAME", "mathsy-rag"))

CONCEPT_NAMESPACE = os.getenv("PINECONE_CONCEPT_NAMESPACE", "concept_notes")
QUESTION_NAMESPACE = os.getenv("PINECONE_QUESTION_NAMESPACE", "question_bank")