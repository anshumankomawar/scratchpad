import os
import json
from fastapi import APIRouter, Depends
from typing import Annotated
import string
from auth.oauth import get_current_user
from dependencies import get_db
from models.user import User
from routers.folders import get_folder_id

router = APIRouter(tags=["documents"], dependencies=[Depends(get_db)])


# gets list of documents for specific user
@router.get("/documents")
async def get_user_documents(
    db: Annotated[dict, Depends(get_db)],
    current_user: Annotated[User, Depends(get_current_user)],
):
    print(current_user)
    try:
        result = (
            db["client"]
            .from_("documents")
            .select("*")
            .eq("email", current_user["email"])
            .execute()
        )
        # group documents by foldername
        documents_by_folder = {}
        for document in result.data:
            foldername = document["foldername"]
            if foldername not in documents_by_folder:
                documents_by_folder[foldername] = []
            documents_by_folder[foldername].append(document)
        return {"documents": documents_by_folder}
    except Exception as e:
        print("Error", e)
        return {"documents": []}


def build_folder_structure(db, current_user, folder_id):
    folders = (
        db["client"]
        .from_("folders")
        .select("*")
        .eq("email", current_user["email"])
        .eq("parent_id", folder_id)
        .execute()
    )
    # documents in this folder
    documents = (
        db["client"]
        .from_("documents")
        .select("*")
        .eq("email", current_user["email"])
        .eq("folder_id", folder_id)
        .order("created_at")
        .execute()
    )

    folder_structure = {}
    for folder in folders.data:
        subfolder_id = folder["id"]
        name = folder["name"]
        folder_structure[name] = build_folder_structure(db, current_user, subfolder_id)

    folder_structure["documents"] = documents.data

    return folder_structure


@router.get("/documentsV2")
async def get_user_documentsV2(
    db: Annotated[dict, Depends(get_db)],
    current_user: Annotated[User, Depends(get_current_user)],
):
    print(current_user)
    try:
        root_id = get_folder_id(db, current_user, "root")["folder_id"]
        folders_under_root = (
            db["client"]
            .from_("folders")
            .select("*")
            .eq("email", current_user["email"])
            .eq("parent_id", root_id)
            .neq("id", root_id)
            .execute()
        )
        print(folders_under_root)

        subfolder_structure = {}

        for folder in folders_under_root.data:
            folder_id = folder["id"]
            name = folder["name"]
            subfolder_structure[name] = build_folder_structure(
                db, current_user, folder_id
            )
            subfolder_structure[name]["id"] = folder_id

        folder_structure = {}
        folder_structure["root"] = subfolder_structure

        return {"folders": folder_structure["root"]}
    except Exception as e:
        print("Error", e)
        return {"folder_structure": {}}
