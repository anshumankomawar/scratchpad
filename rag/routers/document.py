import os
import json
from fastapi import APIRouter, Depends
from typing import Annotated
import string
from auth.oauth import get_current_user
from dependencies import get_db
from models.user import User
from langchain_community.embeddings.openai import OpenAIEmbeddings
from langchain.text_splitter import RecursiveCharacterTextSplitter
from pydantic import BaseModel
from fastapi.exceptions import HTTPException

class DocumentMetadata(BaseModel):
    filename: str
    content: str

router = APIRouter(tags=["document"], dependencies=[Depends(get_db)])

# Gets document of specified id. No user authentication necessary (endpoint for internal purposes). 
@router.get("/document")
def get_document_by_id(db: Annotated[dict, Depends(get_db)], current_user: Annotated[User, Depends(get_current_user)], id:str):
    try:
        email = current_user["email"]
        document = (
            db["client"].from_("documents").select("*").eq("email",email).eq("id", id).execute()
        )
        if document:
            return {"document": document.data}
        else:
            return {"message": "Document not found"}
    except Exception as e:
        print("Error", e)
        return {"message": "Error getting document by ID"}

# Update document, adds new chunks and embeddings to chunks table
@router.patch("/document")
def update_document(db: Annotated[dict, Depends(get_db)], current_user: Annotated[User, Depends(get_current_user)], doc: DocumentMetadata, id:str):
    try:
        email = current_user["email"]
        document = (
            db["client"].from_("documents").select("*").eq("email",email).eq("id", id).execute()
        )
        if document:
            delete_document(db, current_user, id)
            new_document_id = add_document(db, current_user, doc)['doc_id']
            return {"message": "Documents updated successfully", "doc_id": str(new_document_id)}
        else:
            return {"message": "Document to update not found"}
    except Exception as e:
        print("Error", e)
        return {"message": "Error updating document"}

# Adds document, adds chunks and embeddings to chunks table
@router.post("/document")
def add_document(db: Annotated[dict, Depends(get_db)], current_user: Annotated[User, Depends(get_current_user)], doc: DocumentMetadata):
    try:
        email = current_user["email"]
        document_to_insert = {
            "email": email,
            "content": doc.content,
            "filename": doc.filename
        }
        response = db["client"].from_("documents").insert(document_to_insert).execute()
        new_document_id = response.data[0]['id']
        #creating chunks
        text_splitter = RecursiveCharacterTextSplitter(chunk_size=500, chunk_overlap=100)
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
        return {"message": "Document added successfully", "doc_id": str(new_document_id)}
    except Exception as e:
        print("Error", e)
        return {"message": "Error adding document"}

# Delete document
@router.delete("/document")
def delete_document(db: Annotated[dict, Depends(get_db)], current_user: Annotated[User, Depends(get_current_user)], id:str):
    try:
        email = current_user["email"]
        # Check if the document exists and belongs to the current user
        existing_document = db["client"].from_("documents").select("*").eq("email",email).eq("id", id).execute()
        if not existing_document:
            raise HTTPException(404, detail="Document not found")
        # Delete document
        db["client"].from_("documents").delete().eq("email",email).eq("id", id).execute()
        #supabase set to cascading delete on foreign key so chunks and query data will get removed automatically
        return {"message": "Document deleted successfully"}
    except Exception as e:
        print("Error", e)
        return {"message": "could not delete document"}


