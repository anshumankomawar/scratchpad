import os
import openai
from openai import OpenAI
import json
from fastapi import APIRouter, Depends
from typing import Annotated
from auth.oauth import get_current_user
from dependencies import get_db
from auth.oauth import get_current_user
from models.user import User
from langchain_community.embeddings.openai import OpenAIEmbeddings
from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain_community.vectorstores import SupabaseVectorStore


router = APIRouter(tags=["document_data"], dependencies=[Depends(get_db)])
client = OpenAI()

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
    
# Gets document of specified id. No user authentication necessary (endpoint for internal purposes). 
@router.get("/get_document/{id}")
def get_document_by_id(db: Annotated[dict, Depends(get_db)], id:str):
    try:
        document = (
            db["client"].from_("document_data").select("*").eq("id", id).execute()
        )
        if document:
            return {"document": document}
        else:
            return {"message": "Document not found"}
    except Exception as e:
        print("Error", e)
        return {"message": "Error getting document by ID"}
    
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

# Search document/chunk database, calls open ai api and returns a response based on provided user query
@router.post("/search")
def search_document(db: Annotated[dict, Depends(get_db)], current_user: Annotated[User, Depends(get_current_user)], query:str):
    try:
        embeddings = OpenAIEmbeddings()
        embedded_query = embeddings.embed_query(query)
        email = current_user["email"]
        # created match_documents function as below (in supabase)
        '''
        create or replace function match_documents (
        email varchar(255), query_embedding vector(1536), match_threshold float,match_count int)
        returns table (
        chunk_id uuid,document_id uuid,content text,similarity float
        )
        language sql stable
        as $$
        select
            chunks.id,chunks.document_id,chunks.content,1 - (chunks.embedding <=> query_embedding) as similarity
        from document_data
        join chunks on chunks.document_id = document_data.id
        where document_data.email = email and chunks.embedding <=> query_embedding < 1 - match_threshold
        order by chunks.embedding <=> query_embedding
        limit match_count;
        $$;
        '''
        similar_chunks = db["client"].rpc('match_documents', {'email':email, 'query_embedding': embedded_query, 'match_threshold': 0.5, 'match_count':10}).execute()
        #can experiment with the above values 
        similar_chunks_data = similar_chunks.data
        all_chunks = "\n\n".join([chunk['content'] for chunk in similar_chunks_data])
        completion_messages = [
        {
            "role": "system",
            "content": "You are an AI assistant with unparalleled expertise. Your knowledge base is a description of a notes from a user.",
        },
        {
            "role": "user",
            "content": query,
        },
        {
            "role": "assistant",
            "content": all_chunks,
        },
    ]
        response = openai.chat.completions.create(
        model="gpt-3.5-turbo-0613",
        messages=completion_messages,
        max_tokens=400,
        temperature=0.4,
        )

        return {"message":response.choices[0].message.content}
    except Exception as e:
        print("Error", e)
        return {"message": "couldnt get results from search query"}
      

@router.get("/document")
async def get_user_documents(db: Annotated[dict, Depends(get_db)], current_user: Annotated[User, Depends(get_current_user)]):
    print(current_user)
    try:
        result = db["client"].from_('document_data').select('filename, content').eq('email', current_user["email"]).execute()
        return {"documents": result.data}
    except Exception as e:
        print("Error", e)
        return {"message": "couldnt get users documents"}
