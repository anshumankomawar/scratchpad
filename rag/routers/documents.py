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
        result = db["client"].from_('documents').select('*').eq('email', current_user["email"]).execute()
        #group documents by foldername
        documents_by_folder = {}
        for document in result.data:
            foldername = document['foldername']
            if foldername not in documents_by_folder:
                documents_by_folder[foldername] = []
            documents_by_folder[foldername].append(document)
        return {"documents": documents_by_folder}
    except Exception as e:
        print("Error", e)
        return {"documents": []}
