from fastapi import APIRouter, Depends
from typing import Annotated
from dependencies import get_db

router = APIRouter(tags=["document_data"], dependencies=[Depends(get_db)])

@router.get("/document_data", tags=["document_data"])
def get_document_data(db: Annotated[dict, Depends(get_db)]):
    try:
        documents = db["client"].from_("document_data").select("*").execute()
        return {"message": documents}
    except Exception as e:
        print("Error", e)
        return {"message": "couldnt get documents"}

@router.get("/get_documents/{email}", tags=["document_data"])
def get_document_data(db: Annotated[dict, Depends(get_db)], email:str):
    try:
        documents = db["client"].from_("document_data").select("*").eq("email", email).execute()
        return {"message": documents}
    except Exception as e:
        print("Error", e)
        return {"message": "couldnt get documents for specified user"}