import os
import openai
from supabase.client import Client, create_client
from langchain_community.embeddings.openai import OpenAIEmbeddings
from langchain_community.vectorstores import SupabaseVectorStore
from langchain.text_splitter import CharacterTextSplitter
from langchain_community.document_loaders import PyPDFLoader
from dotenv import load_dotenv, find_dotenv

_ = load_dotenv(find_dotenv())

openai.api_key = os.environ["OPENAI_API_KEY"]
supabase_url = os.environ["SUPABASE_URL"]
supabase_key = os.environ["SUPABASE_KEY"]

supabase: Client = create_client(supabase_url, supabase_key)
loader = PyPDFLoader("./Project 4.pdf")
documents = loader.load()
text_splitter = CharacterTextSplitter(chunk_size=1000, chunk_overlap=200)
docs = text_splitter.split_documents(documents)
embeddings = OpenAIEmbeddings()
vector_store = SupabaseVectorStore.from_documents(
    docs,
    embeddings,
    client=supabase,
    table_name="documents",
    query_name="match_documents",
)

user_query = input("Enter your query: ")
matched_docs = vector_store.similarity_search(user_query)
injected_docs = "\n\n".join([doc.page_content for doc in matched_docs])

completion_messages = [
    {
        "role": "system",
        "content": "You are an AI assistant with unparalleled expertise operating systems. Your knowledge base is a description of a project called Tiny FS.",
    },
    {
        "role": "user",
        "content": user_query,
    },
    {
        "role": "assistant",
        "content": injected_docs,
    },
]

response = openai.chat.completions.create(
    model="gpt-3.5-turbo-0613",
    messages=completion_messages,
    max_tokens=400,
    temperature=0.4,
)

print("Assistant's Response:")
print(response.choices[0].message.content)
