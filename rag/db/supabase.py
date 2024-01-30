from supabase import Client, create_client
from config import supabase_key, supabase_url


def create_supabase_client():
    supabase: Client = create_client(supabase_url, supabase_key)
    return supabase
