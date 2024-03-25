import os
import json
from fastapi import APIRouter, Depends, HTTPException
from typing import Annotated
import string
from psycopg2.extras import execute_values
from langchain_community.embeddings.openai import OpenAIEmbeddings
from auth.oauth import get_current_user
from dependencies import get_db
from models.user import User
from routers.document import generate_chunks
from routers.folders import get_folder_id
from pydantic import BaseModel
from db.supabase import create_neon_client, create_supabase_transaction
from psycopg2.extensions import connection as Connection

router = APIRouter(
    tags=["documents"],
    dependencies=[
        Depends(get_db),
        Depends(get_current_user),
    ],
)


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
        .eq("isActive", True)
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
        .eq("isActive", True)
        .order("created_at")
        .execute()
    )

    folder_structure = {}
    for folder in folders.data:
        subfolder_id = folder["id"]
        name = folder["name"]
        folder_structure[name] = build_folder_structure(db, current_user, subfolder_id)
        folder_structure[name]["id"] = subfolder_id

    folder_structure["documents"] = documents.data

    return folder_structure


@router.get("/documentsV2")
async def get_user_documentsV2(
    db: Annotated[dict, Depends(get_db)],
    current_user: Annotated[User, Depends(get_current_user)],
):
    try:
        root_id = get_folder_id(db, current_user, "root")["folder_id"]
        folders_under_root = (
            db["client"]
            .from_("folders")
            .select("*")
            .eq("email", current_user["email"])
            .eq("parent_id", root_id)
            .eq("isActive", True)
            .neq("id", root_id)
            .execute()
        )

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


class SyncData(BaseModel):
    add: list
    delete: list
    update: list
    rename: list


async def add_chunks(cur, document):
    chunks = generate_chunks(document["content"])
    embeddings = OpenAIEmbeddings()
    records = []
    current_page = 0
    for chunk in chunks:
        embedding = embeddings.embed_query(chunk)
        metadata = json.dumps(
            {  # Ensure metadata is a JSON-encoded string
                "page": current_page,
                "source": document["filename"],
            }
        )
        record = (
            document["path"],
            chunk,
            metadata,  # Now a string
            embedding,
        )
        records.append(record)
        current_page += 1

    # Assuming `cur` is your cursor object and it's already connected to your database
    execute_values(
        cur,
        'INSERT INTO "chunksV2" (document_path, content, metadata, embedding) VALUES %s',
        records,
    )


@router.put("/v1/sync")
async def sync(
    sync_data: SyncData,
    db: Annotated[dict, Depends(get_db)],
    current_user: Annotated[User, Depends(get_current_user)],
    trans_db: Connection = Depends(create_supabase_transaction),
):
    cur = trans_db.cursor()
    try:
        email = current_user["email"]

        # Handle 'add' operations
        for document in sync_data.add:
            if document["type"] == "folder":
                cur.execute(
                    'INSERT INTO "foldersV2" (foldername, email, icon, path, parent_path) VALUES (%s, %s, %s, %s, %s)',
                    (document["filename"], email, None, document["path"], email),
                )
            elif document["type"] == "file":
                cur.execute(
                    'INSERT INTO "documentsV2" (filename, email, path, folder_path, content, filetype) VALUES (%s, %s, %s, %s, %s, %s)',
                    (
                        document["filename"],
                        email,
                        document["path"],
                        document["folderpath"],
                        document["content"],
                        document["extension"],
                    ),
                )

                await add_chunks(cur, document)

        # Handle 'update' operations
        for document in sync_data.update:
            if document["type"] == "file":
                cur.execute(
                    'UPDATE "documentsV2" SET content = %s WHERE path = %s AND email = %s',
                    (document["content"], document["path"], email),
                )

                cur.execute(
                    'DELETE FROM "chunksV2" WHERE document_path = %s',
                    (document["path"],),
                )

                await add_chunks(cur, document)

        # Handle 'rename' operations
        for document in sync_data.rename:
            if document["type"] == "folder":
                cur.execute(
                    'UPDATE "foldersV2" SET foldername = %s, path = %s WHERE path = %s AND email = %s',
                    (
                        document["newFilename"],
                        document["newPath"],
                        document["oldPath"],
                        email,
                    ),
                )

                cur.execute(
                    """
                    UPDATE "documentsV2"
                    SET path = CONCAT(%s, '/', SUBSTRING(path FROM '[^/]*$'))
                    WHERE folder_path = %s AND email = %s
                    """,
                    (
                        document["newPath"],  # The base new path to replace with
                        document["newPath"],
                        email,  # Assuming you also want to filter by email
                    ),
                )

            elif document["type"] == "file":
                cur.execute(
                    'UPDATE "documentsV2" SET filename = %s, path = %s WHERE path = %s AND email = %s',
                    (
                        document["newFilename"],
                        document["newPath"],
                        document["oldPath"],
                        email,
                    ),
                )

                cur.execute(
                    """
                    UPDATE "chunksV2"
                    SET metadata = jsonb_set(metadata, '{source}', %s::jsonb)
                    WHERE document_path = %s
                    """,
                    (
                        f'"{document["newFilename"]}"',  # New source value, converting to JSONB
                        document["newPath"],
                    ),
                )

        # Handle 'delete' operations
        for document in sync_data.delete:
            if document["type"] == "folder":
                cur.execute(
                    'DELETE FROM "foldersV2" WHERE path = %s AND email = %s',
                    (document["path"], email),
                )
            elif document["type"] == "file":
                cur.execute(
                    'DELETE FROM "documentsV2" WHERE path = %s AND email = %s',
                    (document["path"], email),
                )

        # Commit the transaction
        trans_db.commit()

    except Exception as e:
        # Rollback the transaction in case of any error
        trans_db.rollback()
        print("Error", e)
        raise HTTPException(status_code=500, detail=f"Error during sync operation: {e}")

    finally:
        # Always close the cursor
        if cur is not None:
            cur.close()

    return {"message": "Sync successful"}
