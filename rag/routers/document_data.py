import os
from fastapi_utils.timing import record_timing
import random
import openai
from openai import OpenAI
import json
from fastapi import APIRouter, Depends
from typing import Annotated
import string

from starlette.requests import Request
from auth.oauth import get_current_user
from dependencies import get_db
from auth.oauth import get_current_user
from models.user import User
from langchain_community.embeddings.openai import OpenAIEmbeddings
from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain_community.vectorstores import SupabaseVectorStore


router = APIRouter(tags=["document_data"], dependencies=[Depends(get_db)])
client = OpenAI()

# Gets list of documents for the specific user that is logged in. 
@router.get("/get_documents")
async def get_documents(db: Annotated[dict, Depends(get_db)], current_user: Annotated[User, Depends(get_current_user)]):
    try:
        email = current_user["email"]
        documents = db["client"].from_("document_data").select("*").eq("email", email).execute()
        return {"message": documents}
    except Exception as e:
        print("Error", e)
        return {"message": "couldnt get documents for specified user"}
    
# Gets document of specified id. No user authentication necessary (endpoint for internal purposes). 
@router.get("/get_document/{id}")
def get_document_by_id(db: Annotated[dict, Depends(get_db)], id:str):
    try:
        document = (
            db["client"].from_("document_data").select("*").eq("id", id).execute()
        )
        if document:
            return {"document": document}
        else:
            return {"message": "Document not found"}
    except Exception as e:
        print("Error", e)
        return {"message": "Error getting document by ID"}

from pydantic import BaseModel

class DocumentMetadata(BaseModel):
    filename: str
    content: str


# Add document, adds chunks and embeddings to chunks table
@router.post("/add_document", tags=["documents"])
def add_documents(db: Annotated[dict, Depends(get_db)], current_user: Annotated[User, Depends(get_current_user)], doc: DocumentMetadata):
    try:
        email = current_user["email"]
        document_to_insert = {
            "email": email,
            "content": doc.content,
            "filename": doc.filename
        }
        response = db["client"].from_("document_data").insert(document_to_insert).execute()
        new_document_id = response.data[0]['id']

        #creating chunks
        text_splitter = RecursiveCharacterTextSplitter(chunk_size=50, chunk_overlap=0)
        #can experiment with above chunk_size and overlap values as needed
        chunks = text_splitter.split_text(doc.content)
        embeddings = OpenAIEmbeddings()
        records_to_insert = []
        current_page = 0
        for chunk in chunks:
            embedding = embeddings.embed_query(chunk)
            record = {
                "document_id": new_document_id,
                "content": chunk,
                "metadata": {
                    "page": current_page,
                    "source": doc.filename
                }, 
                "embedding": embedding
            }
            records_to_insert.append(record)
            current_page+=1
        db["client"].from_("chunks").insert(records_to_insert).execute()
        return {"message": "Documents added successfully", "doc_id": str(new_document_id)}
    except Exception as e:
        print("Error", e)
        return {"message": "Error adding document"}

# Search document/chunk database, calls open ai api and returns a response based on provided user query
@router.post("/search")
def search_document(request: Request, db: Annotated[dict, Depends(get_db)], current_user: Annotated[User, Depends(get_current_user)], query:str):
    try:
        embeddings = OpenAIEmbeddings()
        embedded_query = embeddings.embed_query(query)
        email = current_user["email"]

        record_timing(request, "DATABASE: function -> match_queries")
        similar_queries = db["client"].rpc('match_queries', {'email': email, 'query_embedding': embedded_query, 'match_threshold': 0.95, 'match_count':1}).execute()
        record_timing(request, "DATABASE: function -> match_queries")

        if similar_queries.data == []:
            # we couldn't find a similar enough query so we make a new generated document and save it
            similar_chunks = db["client"].rpc('match_documents', {'email':email, 'query_embedding': embedded_query, 'match_threshold': 0.5, 'match_count':10}).execute()
            print("WHAT IS HTIS ", similar_chunks)
            record_timing(request, "finished match documents")
            similar_chunks_data = similar_chunks.data
            all_chunks = "\n\n".join([chunk['content'] for chunk in similar_chunks_data])
            completion_messages = [
                {
                    "role": "system",
                    "content": "You are an AI assistant with unparalleled expertise. Your knowledge base is a description of a notes from a user. Do not use knowledge outside of what you have been provided. Compile a note based on the users query.",
                },
                {
                    "role": "user",
                    "content": query,
                },
                {
                    "role": "assistant",
                    "content": all_chunks,
                },
            ]
            record_timing(request, "started gpt")
            response = openai.chat.completions.create(
                model="gpt-3.5-turbo-0125",
                messages=completion_messages,
                max_tokens=400,
                temperature=0.4,
            )
            record_timing(request, "finished gpt")

            insert = DocumentMetadata(filename="generated", content=response.choices[0].message.content)
            document_created = add_documents(db, current_user, insert)
            record_timing(request, "DATABASE: function -> added document to the database")

            document = db["client"].from_("document_data").select("*").eq("email", email).eq("id", document_created["doc_id"]).execute()

            record_timing(request, "DATABASE: function -> got back document based on doc_id")
            db["client"].from_("queries").insert([{"email": email, "query_content": query, "embedding": embedded_query, "metadata": {}, "doc": document.data[0]["id"]}]).execute()

            return {"data": response.choices[0].message.content}
        else:
            # we found a similar enough query so we just return the response
            similar_query = similar_queries.data[0]
            record_timing(request, "DATABASE: function -> match_similar_document")
            document = db["client"].from_("document_data").select("*").eq("id", similar_query["doc"]).execute()
            record_timing(request, "DATABASE: function -> match_similar_document")
            return {"data": document.data[0]["content"]}
    except Exception as e:
        print("Error", e)
        return {"error": "couldnt get results from search query"}
      

@router.get("/document")
async def get_user_documents(db: Annotated[dict, Depends(get_db)], current_user: Annotated[User, Depends(get_current_user)]):
    print(current_user)
    try:
        result = db["client"].from_('document_data').select('filename, content').eq('email', current_user["email"]).execute()
        return {"documents": result.data}
    except Exception as e:
        print("Error", e)
        return {"message": "couldnt get users documents"}
