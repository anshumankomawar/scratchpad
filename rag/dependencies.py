def get_db():
    from db.supabase import create_supabase_client
    return {"client":create_supabase_client()}