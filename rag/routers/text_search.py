import os
import json
from fastapi import APIRouter, Depends
from typing import Annotated
import string
from auth.oauth import get_current_user
from dependencies import get_db
from models.user import User
from fastapi.exceptions import HTTPException

router = APIRouter(tags=["text_search"], dependencies=[Depends(get_db)])
@router.post("/text_search")
def text_search(db: Annotated[dict, Depends(get_db)], current_user: Annotated[User, Depends(get_current_user)], query:str):
    try:
        email = current_user["email"]
        similar_documents = db["client"].rpc('text_search', {'email':email, 'query': query}).execute()
        return {"data": similar_documents.data}
    except Exception as e:
        print("Error", e)
        return {"error": "couldnt get results from search query"}