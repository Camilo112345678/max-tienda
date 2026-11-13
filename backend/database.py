import os

from dotenv import load_dotenv
from supabase import create_client

load_dotenv()  # lee el archivo .env cuando trabajas en tu computador

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")

if not SUPABASE_URL or not SUPABASE_KEY:
    raise RuntimeError("Faltan SUPABASE_URL y SUPABASE_KEY (revisa tu .env o las variables de Render)")

supabase = create_client(SUPABASE_URL, SUPABASE_KEY)
