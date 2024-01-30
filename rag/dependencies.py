from db.supabase import create_supabase_client


def get_db():
    return {"client": create_supabase_client()}
