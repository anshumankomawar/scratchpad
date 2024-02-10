import os
import json
from fastapi import APIRouter, Depends
from typing import Annotated
import string
from auth.oauth import get_current_user
from dependencies import get_db
from models.user import User

router = APIRouter(tags=["documents"], dependencies=[Depends(get_db)])

#gets list of documents for specific user
@router.get("/documents")
async def get_user_documents(db: Annotated[dict, Depends(get_db)], current_user: Annotated[User, Depends(get_current_user)]):
    print(current_user)
    try:
        result = db["client"].from_('documents').select('filename, content').eq('email', current_user["email"]).execute()
        return {"documents": result.data}
    except Exception as e:
        print("Error", e)
        return {"message": "could not get users documents"}
