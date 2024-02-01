import json
from fastapi import APIRouter, Depends
from typing import Annotated
from dependencies import get_db
from auth.oauth import get_current_user
from models.user import User
from langchain_community.embeddings.openai import OpenAIEmbeddings
from langchain.text_splitter import RecursiveCharacterTextSplitter

router = APIRouter(tags=["document_data"], dependencies=[Depends(get_db), Depends(get_current_user)])

# Gets list of documents for the specific user that is logged in. 
@router.get("/get_documents")
async def get_documents(db: Annotated[dict, Depends(get_db)], current_user: Annotated[User, Depends(get_current_user)]):
    try:
        email = current_user["email"]
        documents = db["client"].from_("document_data").select("*").eq("email", email).execute()
        return {"message": documents}
    except Exception as e:
        print("Error", e)
        return {"message": "couldnt get documents for specified user"}
    
# Add document, adds chunks and embeddings to chunks table
@router.post("/add_document", tags=["documents"])
def add_documents(db: Annotated[dict, Depends(get_db)], current_user: Annotated[User, Depends(get_current_user)], filename:str, content:str):
    try:
        email = current_user["email"]
        document_to_insert = {
            "email":email,
            "content":content,
            "filename":filename
        }
        response = db["client"].from_("document_data").insert(document_to_insert).execute()
        new_document_id = (json.loads(response.json()))['data'][0]['id']

        #creating chunks
        text_splitter = RecursiveCharacterTextSplitter(chunk_size=1000, chunk_overlap=0)
        #can experiment with above chunk_size and overlap values as needed
        chunks = text_splitter.split_text(content)
        embeddings = OpenAIEmbeddings()
        records_to_insert = []
        current_page =0
        for chunk in chunks:
            embedding = embeddings.embed_query(chunk)
            record = {
                "document_id":new_document_id,
                "content": chunk,
                "metadata": {
                    "page":current_page,
                    "source":filename
                }, 
                "embedding": embedding
            }
            records_to_insert.append(record)
            current_page+=1
        db["client"].from_("chunks").insert(records_to_insert).execute()
        return {"message": "Documents added successfully"}
    except Exception as e:
        print("Error", e)
        return {"message": "Error adding document"}

    