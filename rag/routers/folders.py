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
    icon:str =None

class UpdateFolderMetadata(BaseModel):
    name:str
    icon:str =None
    id:str

#adds folder to folders table
@router.post("/folders")
def add_folder(db: Annotated[dict, Depends(get_db)], current_user: Annotated[User, Depends(get_current_user)], folder: FolderMetadata, parent_id:str):
    try:
        email = current_user["email"]
        if parent_id:
            existing_folder = db["client"].from_('folders').select("id").eq("email", email).eq("parent_id", parent_id).eq("name", folder.name).execute()
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

@router.patch("/folders")
def update_folder(db: Annotated[dict, Depends(get_db)], current_user: Annotated[User, Depends(get_current_user)], folder: UpdateFolderMetadata):
    try:
        email = current_user["email"]
        document = (
            db["client"].from_("folders").select("*").eq("email",email).eq("id", folder.id).execute()
        )
        if document:
            db["client"].from_("folders").update({'name':folder.name}).eq("email", email).eq("id", folder.id).execute()
            return {"message": "Updated folder successfully"}
        else:
            return {"message": "Folder to update not found"}
    except Exception as e:
        print("Error", e)
        return {"message": "Error updating folder"}

def get_folder_id(db: Annotated[dict, Depends(get_db)], current_user: Annotated[User, Depends(get_current_user)], name:str ):
    try:
        email = current_user["email"]
        root_dir = db["client"].from_('folders').select("id").eq("email", email).eq("name", name).execute()
        root_id = root_dir.data[0]['id']
        return {"folder_id": str(root_id)}
    except Exception as e:
        print("Error", e)
        return {"message": "Could not get root directory"}

def get_or_make_generated_folder(db: Annotated[dict, Depends(get_db)], current_user: Annotated[User, Depends(get_current_user)]):
    try:
        email = current_user["email"]
        generated_dir = db["client"].from_('folders').select("id").eq("email", email).eq("name", "generated").execute()
        if generated_dir.data!=[]:
            generated_id = generated_dir.data[0]['id']
        else:
            folder_to_add = FolderMetadata(name="generated")
            root_id = get_folder_id(db, current_user, "root")['folder_id']
            result = add_folder(db, current_user, folder_to_add, root_id)
            generated_id = result['folder_id']
        return {"generated_id": str(generated_id)}
    except Exception as e:
        print("Error", e)
        return {"message": "Could not find generated directory"}