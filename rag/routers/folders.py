import os
import json
from fastapi import APIRouter, Depends
from typing import Annotated
import string
from auth.oauth import get_current_user
from dependencies import get_db
from models.user import User
from pydantic import BaseModel

router = APIRouter(tags=["folders"], dependencies=[Depends(get_db)])

class FolderMetadata(BaseModel):
    name:str
    icon:str

#adds folder to folders table
@router.post("/folders")
def add_folder(db: Annotated[dict, Depends(get_db)], current_user: Annotated[User, Depends(get_current_user)], folder: FolderMetadata, parent_id:str):
    try:
        email = current_user["email"]
        if parent_id:
            existing_folder = db["client"].from_('folders').select("id").eq("email", email).eq("parent_id", parent_id).eq("name", folder.name).execute()
            print("existing FOLDER", existing_folder)
            if existing_folder.data!=[]:
                return {"message": "Folder with same name and location already exists"}
            else:
                folder_to_insert = {
                    "name": folder.name,
                    "email":email, 
                    "icon":folder.icon,
                    "parent_id":parent_id
                }
                response = db["client"].from_("folders").insert(folder_to_insert).execute()
                new_folder_id = response.data[0]['id']
                return {"folder_id": str(new_folder_id)}
        else:
            return {"message": "Folder does not exist"}
    except Exception as e:
        print("Error", e)
        return {"message": "Error adding folder"}

