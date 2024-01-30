import os
from dotenv import load_dotenv, find_dotenv

_ = load_dotenv(find_dotenv())

supabase_url = os.environ["SUPABASE_URL"]
supabase_key = os.environ["SUPABASE_KEY"]
