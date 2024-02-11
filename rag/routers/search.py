import os
from fastapi_utils.timing import record_timing
import openai
from openai import OpenAI
import json
from fastapi import APIRouter, Depends
from typing import Annotated
import string
from starlette.requests import Request
from auth.oauth import get_current_user
from dependencies import get_db
from models.user import User
from langchain_community.embeddings.openai import OpenAIEmbeddings
from langchain.text_splitter import RecursiveCharacterTextSplitter
from .document import add_document
from pydantic import BaseModel

class DocumentMetadata(BaseModel):
    filename: str
    content: str

router = APIRouter(tags=["search"], dependencies=[Depends(get_db)])

def generate_summary_openai(request: Request, all_chunks: str, query: str):
    completion_messages = [
        {
            "role": "system",
            "content": """ 
                        As a professional summarizer, create a concise and comprehensive 50 WORD summary of the provided text, be it an article, post, conversation, or passage, while adhering to these guidelines:

                            
                            1. Craft a summary that is detailed, thorough, in-depth, and complex, while maintaining clarity and conciseness.

                                                        
                            2. Incorporate main ideas and essential information, eliminating extraneous language and focusing on critical aspects.

                                                        
                            3. Rely strictly on the provided text, without including external information.

                                                        
                            4. Format the summary in paragraph form for easy understanding.

                        
                        By following this optimized prompt, you will generate an effective summary that encapsulates the essence of the given text in a clear, concise, and reader-friendly manner.
                        """
        },
        {
            "role": "user",
            "content": query +  "Don’t give information not mentioned in the CONTEXT INFORMATION.",
        },
        {
            "role": "assistant",
            "content": all_chunks,
        },
    ]
    record_timing(request, "started gpt")
    response = openai.chat.completions.create(
        model="gpt-3.5-turbo-0125",
        messages=completion_messages,
        max_tokens=400,
        temperature=0.4,
    )
    record_timing(request, "finished gpt")
    return response.choices[0].message.content

# def generate_summary_falcon(request: Request, all_chunks: str, query: str):
#     summarizer = pipeline("summarization", model="Falconsai/text_summarization")
#     print("***************GENERATING SUMMARY**************\n")
#     result = summarizer(all_chunks, max_length=200, min_length=30, do_sample=False)
#     print("***************SUMMARY GENERATED**************\n")
#     return result[0]["summary_text"]

# Search document/chunk database, calls open ai api and returns a response based on provided user query
@router.post("/search")
def search_document(request: Request, db: Annotated[dict, Depends(get_db)], current_user: Annotated[User, Depends(get_current_user)], query:str):
    try:
        embeddings = OpenAIEmbeddings()
        embedded_query = embeddings.embed_query(query)
        email = current_user["email"]

        similar_queries = db["client"].rpc('match_queries', {'email': email, 'query_embedding': embedded_query, 'match_threshold': 0.95, 'match_count':1}).execute()

        if similar_queries.data == []:
            print("***************NO SIMILAR QUERIES FOUND, GENERATING NEW DOCUMENT**************\n")
            similar_chunks = db["client"].rpc('match_documents', {'email':email, 'query_embedding': embedded_query, 'match_threshold': 0.5, 'match_count':10}).execute()
            similar_chunks_data = similar_chunks.data
            print(similar_chunks_data)
            all_chunks = "\n\n".join([chunk['content'] for chunk in similar_chunks_data])

            data = generate_summary_openai(request, all_chunks, query)
            # data = generate_summary_falcon(request, all_chunks, query)

            print("***************GENERATED DATA**************\n")
            insert = DocumentMetadata(filename="generated", content=data)
            print("***************TRYING TO INSERT DATA**************\n")
            document_created = add_document(db, current_user, insert)
            print("***************INSERTED DATA**************\n")

            document = db["client"].from_("documents").select("*").eq("email", email).eq("id", document_created["doc_id"]).execute()
            print("***************RETRIEVED DOCUMENT**************\n")

            db["client"].from_("queries").insert([{"email": email, "query_content": query, "embedding": embedded_query, "metadata": {}, "doc": document_created["doc_id"]}]).execute()

            return {"data": data}
        else:
            print("***************FOUND SIMILAR QUERY, NO GENERATION REQUIRED**************\n")
            similar_query = similar_queries.data[0]
            document = db["client"].from_("documents").select("*").eq("id", similar_query["doc"]).execute()
            return {"data": document.data[0]["content"]}
    except Exception as e:
        print("Error", e)
        return {"error": "couldnt get results from search query"}
