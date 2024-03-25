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
from typing import List
from routers.folders import get_folder_id


class DocumentMetadata(BaseModel):
    filename: str
    content: str
    foldername: str = "unfiled"


class UpdatedDocumentMetadata(BaseModel):
    filename: str
    content: str
    foldername: str = "unfiled"
    id: str


class DocumentMetadataV2(BaseModel):
    filename: str
    content: str
    folder_id: str = ""
    filetype: str


class UpdatedDocumentMetadataV2(BaseModel):
    filename: str
    content: str
    folder_id: str = ""
    id: str


router = APIRouter(tags=["document"], dependencies=[Depends(get_db)])


# Gets document of specified id. No user authentication necessary (endpoint for internal purposes).
@router.get("/document")
def get_document_by_id(
    db: Annotated[dict, Depends(get_db)],
    current_user: Annotated[User, Depends(get_current_user)],
    id: str,
):
    try:
        email = current_user["email"]
        document = (
            db["client"]
            .from_("documents")
            .select("*")
            .eq("email", email)
            .eq("id", id)
            .execute()
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
def update_document(
    db: Annotated[dict, Depends(get_db)],
    current_user: Annotated[User, Depends(get_current_user)],
    doc: UpdatedDocumentMetadataV2,
):
    try:
        email = current_user["email"]
        document = (
            db["client"]
            .from_("documents")
            .select("*")
            .eq("email", email)
            .eq("id", doc.id)
            .execute()
        )
        if document:
            delete_document(db, current_user, doc.id)
            metadata = DocumentMetadataV2(
                filename=doc.filename,
                content=doc.content,
                folder_id=doc.folder_id,
                filetype=document.data[0]["filetype"],
            )
            new_document_id = add_documentV2(db, current_user, metadata)["doc_id"]
            return {
                "message": "Documents updated successfully",
                "doc_id": str(new_document_id),
            }
        else:
            return {"message": "Document to update not found"}
    except Exception as e:
        print("Error", e)
        return {"message": "Error updating document"}


def generate_chunks(content: str) -> List[str]:
    if len(content) < 1000:
        chunk_size = 200
    elif len(content) < 5000:
        chunk_size = 500
    else:
        chunk_size = 1000
    text_splitter = RecursiveCharacterTextSplitter(
        chunk_size=chunk_size, chunk_overlap=100
    )
    chunks = text_splitter.split_text(content)
    return chunks


# Adds document, adds chunks and embeddings to chunks table
@router.post("/document")
def add_document(
    db: Annotated[dict, Depends(get_db)],
    current_user: Annotated[User, Depends(get_current_user)],
    doc: DocumentMetadata,
    generated: bool = False,
):
    try:
        email = current_user["email"]
        document_to_insert = {
            "email": email,
            "content": doc.content,
            "filename": doc.filename,
            "foldername": doc.foldername,
            "generated": generated,
        }
        response = db["client"].from_("documents").insert(document_to_insert).execute()
        new_document_id = response.data[0]["id"]
        if generated == False:
            chunks = generate_chunks(doc.content)
            embeddings = OpenAIEmbeddings()
            records_to_insert = []
            current_page = 0
            for chunk in chunks:
                embedding = embeddings.embed_query(chunk)
                record = {
                    "document_id": new_document_id,
                    "content": chunk,
                    "metadata": {"page": current_page, "source": doc.filename},
                    "embedding": embedding,
                }
                records_to_insert.append(record)
                current_page += 1
            db["client"].from_("chunks").insert(records_to_insert).execute()
        return {"doc_id": str(new_document_id)}
    except Exception as e:
        print("Error", e)
        return {"doc_id": None}


# Adds document, adds chunks and embeddings to chunks table
@router.post("/documentV2")
def add_documentV2(
    db: Annotated[dict, Depends(get_db)],
    current_user: Annotated[User, Depends(get_current_user)],
    doc: DocumentMetadataV2,
    generated: bool = False,
):
    try:
        email = current_user["email"]
        if doc.folder_id == "":
            # defaults to unfiled folder if non specified
            folder_id = get_folder_id(db, current_user, "unfiled")["folder_id"]
        else:
            folder_id = doc.folder_id
        document_to_insert = {
            "email": email,
            "content": doc.content,
            "filename": doc.filename,
            "generated": generated,
            "folder_id": folder_id,
            "filetype": doc.filetype,
        }
        response = db["client"].from_("documents").insert(document_to_insert).execute()
        new_document_id = response.data[0]["id"]
        if generated == False:
            chunks = generate_chunks(doc.content)
            embeddings = OpenAIEmbeddings()
            records_to_insert = []
            current_page = 0
            for chunk in chunks:
                embedding = embeddings.embed_query(chunk)
                record = {
                    "document_id": new_document_id,
                    "content": chunk,
                    "metadata": {"page": current_page, "source": doc.filename},
                    "embedding": embedding,
                }
                records_to_insert.append(record)
                current_page += 1
            db["client"].from_("chunks").insert(records_to_insert).execute()
        return {"doc_id": str(new_document_id)}
    except Exception as e:
        print("Error", e)
        return {"doc_id": None}


# Delete document
@router.delete("/document")
def delete_document(
    db: Annotated[dict, Depends(get_db)],
    current_user: Annotated[User, Depends(get_current_user)],
    id: str,
):
    try:
        email = current_user["email"]
        # Check if the document exists and belongs to the current user
        document = (
            db["client"]
            .from_("documents")
            .select("*")
            .eq("email", email)
            .eq("id", id)
            .execute()
        )
        if document:
            # Delete document
            # setting the isActive to FALSE
            db["client"].from_("documents").update({"isActive": False}).eq(
                "email", email
            ).eq("id", id).execute()
        else:
            raise HTTPException(404, detail="Document not found")
        return {"message": "Document deleted successfully"}
    except Exception as e:
        print("Error", e)
        return {"message": "could not delete document"}


# Update foldername
# to be deleted, and replaced with update folders in folders.py
@router.post("/update_foldername")
def update_document_folder(
    db: Annotated[dict, Depends(get_db)],
    current_user: Annotated[User, Depends(get_current_user)],
    id: str,
    foldername: str,
):
    try:
        email = current_user["email"]
        document = (
            db["client"]
            .from_("documents")
            .select("*")
            .eq("email", email)
            .eq("id", id)
            .execute()
        )
        if document:
            db["client"].from_("documents").update({"foldername": foldername}).eq(
                "email", email
            ).eq("id", id).execute()
        else:
            raise HTTPException(404, detail="Document not found")
        return {"message": "foldername updated successfully"}
    except Exception as e:
        print("Error", e)
        return {"message": "could not update document foldername"}
