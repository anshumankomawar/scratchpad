from fastapi import APIRouter, Depends
from typing import Annotated
from dependencies import get_db

router = APIRouter(tags=["documents"], dependencies=[Depends(get_db)])


@router.post("/documents", tags=["documents"])
def get_documents(db: Annotated[dict, Depends(get_db)]):
    try:
        documents = db["client"].from_("documents").select("*").execute()
        return {"message": documents}
    except Exception as e:
        print("Error", e)
        return {"message": "couldnt get documents"}

@router.get("/get_document_users", tags=["documents"])
def get_document_users(db: Annotated[dict, Depends(get_db)], doc_id: str):
    try:
        doc_users = (
            db["client"].from_("user_perms").select("*").eq("doc_id", doc_id).execute()
        )
        return doc_users
    except Exception as e:
        print("Error", e)
        return {"message": "couldnt get documents"}
    
@router.get("/documents/{id}", tags=["documents"])
def get_document_by_id(db: Annotated[dict, Depends(get_db)], id:str):
    try:
        document = (
            db["client"].from_("documents").select("*").eq("id", id).execute()
        )
        if document:
            return {"document": document}
        else:
            return {"message": "Document not found"}
    except Exception as e:
        print("Error", e)
        return {"message": "Error getting document by ID"}