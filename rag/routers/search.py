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
from .document import add_document, add_documentV2
from pydantic import BaseModel
from routers.folders import get_or_make_generated_folder


class DocumentMetadata(BaseModel):
    filename: str
    content: str
    foldername: str = "generated"

class DocumentMetadataV2(BaseModel):
    filename: str
    content: str
    folder_id: str = ""


router = APIRouter(tags=["search"], dependencies=[Depends(get_db)])


def generate_summary_openai(request: Request, all_chunks: str, query: str):
    completion_messages = [
        {
            "role": "system",
            "content": "System: Generate a note based solely on the following text. Do not include any explanations.",
        },
        {"role": "system", "content": "System: Text: " + all_chunks},
        {"role": "user", "content": "User: " + query},
        {"role": "system", "content": "Note:"},
    ]
    record_timing(request, "started gpt")
    response = openai.chat.completions.create(
        model="gpt-4",
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
def search_document(
    request: Request,
    db: Annotated[dict, Depends(get_db)],
    current_user: Annotated[User, Depends(get_current_user)],
    query: str,
):
    try:
        embeddings = OpenAIEmbeddings()
        embedded_query = embeddings.embed_query(query)
        email = current_user["email"]

        similar_queries = (
            db["client"]
            .rpc(
                "match_queries",
                {
                    "email": email,
                    "query_embedding": embedded_query,
                    "match_threshold": 0.95,
                    "match_count": 1,
                },
            )
            .execute()
        )

        if similar_queries.data == []:
            print(
                "***************NO SIMILAR QUERIES FOUND, GENERATING NEW DOCUMENT**************\n"
            )
            similar_chunks = (
                db["client"]
                .rpc(
                    "match_documents",
                    {
                        "email": email,
                        "query_embedding": embedded_query,
                        "match_threshold": 0.5,
                        "match_count": 10,
                    },
                )
                .execute()
            )
            similar_chunks_data = similar_chunks.data
            all_chunks = "\n\n".join(
                [chunk["content"] for chunk in similar_chunks_data]
            )

            data = generate_summary_openai(request, all_chunks, query)
            # data = generate_summary_falcon(request, all_chunks, query)

            print("***************GENERATED DATA**************\n")
            insert = DocumentMetadata(filename=query, content=data)
            print("***************TRYING TO INSERT DATA**************\n")
            document_created = add_document(db, current_user, insert, True)
            print("***************INSERTED DATA**************\n")

            document = (
                db["client"]
                .from_("documents")
                .select("*")
                .eq("email", email)
                .eq("id", document_created["doc_id"])
                .execute()
            )
            print("***************RETRIEVED DOCUMENT**************\n")

            db["client"].from_("queries").insert(
                [
                    {
                        "email": email,
                        "query_content": query,
                        "embedding": embedded_query,
                        "metadata": {},
                        "doc": document_created["doc_id"],
                    }
                ]
            ).execute()

            return {"data": data, "references": similar_chunks_data}
        else:
            print(
                "***************FOUND SIMILAR QUERY, NO GENERATION REQUIRED**************\n"
            )
            similar_query = similar_queries.data[0]
            document = (
                db["client"]
                .from_("documents")
                .select("*")
                .eq("id", similar_query["doc"])
                .execute()
            )
            return {"data": document.data[0]["content"], "references": []}
    except Exception as e:
        print("Error", e)
        return {"error": "couldnt get results from search query"}



# Search document/chunk database, calls open ai api and returns a response based on provided user query
@router.post("/searchV2")
def search_documentV2(
    request: Request,
    db: Annotated[dict, Depends(get_db)],
    current_user: Annotated[User, Depends(get_current_user)],
    query: str,
):
    try:
        embeddings = OpenAIEmbeddings()
        embedded_query = embeddings.embed_query(query)
        email = current_user["email"]

        similar_queries = (
            db["client"]
            .rpc(
                "match_queries",
                {
                    "email": email,
                    "query_embedding": embedded_query,
                    "match_threshold": 0.95,
                    "match_count": 1,
                },
            )
            .execute()
        )

        if similar_queries.data == []:
            print(
                "***************NO SIMILAR QUERIES FOUND, GENERATING NEW DOCUMENT**************\n"
            )
            similar_chunks = (
                db["client"]
                .rpc(
                    "match_documents",
                    {
                        "email": email,
                        "query_embedding": embedded_query,
                        "match_threshold": 0.5,
                        "match_count": 10,
                    },
                )
                .execute()
            )
            similar_chunks_data = similar_chunks.data
            all_chunks = "\n\n".join(
                [chunk["content"] for chunk in similar_chunks_data]
            )

            data = generate_summary_openai(request, all_chunks, query)
            # data = generate_summary_falcon(request, all_chunks, query)

            print("***************GENERATED DATA**************\n")
            generated_id = get_or_make_generated_folder(db, current_user)['generated_id']
            print("GENERATED ID", generated_id)
            insert = DocumentMetadataV2(filename=query, content=data, folder_id = generated_id)
            print("***************TRYING TO INSERT DATA**************\n")
            document_created = add_documentV2(db, current_user, insert, True)
            print("***************INSERTED DATA**************\n")

            document = (
                db["client"]
                .from_("documents")
                .select("*")
                .eq("email", email)
                .eq("id", document_created["doc_id"])
                .execute()
            )
            print("***************RETRIEVED DOCUMENT**************\n")

            db["client"].from_("queries").insert(
                [
                    {
                        "email": email,
                        "query_content": query,
                        "embedding": embedded_query,
                        "metadata": {},
                        "doc": document_created["doc_id"],
                    }
                ]
            ).execute()

            return {"data": data, "references": similar_chunks_data}
        else:
            print(
                "***************FOUND SIMILAR QUERY, NO GENERATION REQUIRED**************\n"
            )
            similar_query = similar_queries.data[0]
            document = (
                db["client"]
                .from_("documents")
                .select("*")
                .eq("id", similar_query["doc"])
                .execute()
            )
            return {"data": document.data[0]["content"], "references": []}
    except Exception as e:
        print("Error", e)
        return {"error": "couldnt get results from search query"}
