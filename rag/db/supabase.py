from supabase import Client, create_client
from config import supabase_key, supabase_url
from dotenv import load_dotenv
import psycopg2
import os
from fastapi import HTTPException


def create_supabase_client():
    supabase: Client = create_client(supabase_url, supabase_key)
    return supabase


def create_supabase_transaction():
    load_dotenv()
    connection_string = os.getenv("SUPABASE_TRANSACTION")
    try:
        conn = psycopg2.connect(connection_string)
        return conn
    except psycopg2.OperationalError as e:
        print(e)
        raise HTTPException(status_code=500, detail="Database connection failed")


def create_neon_client():
    load_dotenv()
    connection_string = os.getenv("DATABASE_URL")
    try:
        conn = psycopg2.connect(connection_string)
        return conn
    except psycopg2.OperationalError as e:
        raise HTTPException(status_code=500, detail="Database connection failed")
