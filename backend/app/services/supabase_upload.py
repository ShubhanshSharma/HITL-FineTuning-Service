# app/services/supabase_storage.py
from supabase import create_client
import os
from pathlib import Path

supabase = create_client(
    os.getenv("SUPABASE_URL"),
    os.getenv("SUPABASE_SERVICE_ROLE_KEY"),
)

BUCKET = "training-data"


def upload_jsonl(file_path: Path, object_path: str) -> str:
    with file_path.open("rb") as f:
        supabase.storage.from_(BUCKET).upload(
            path=object_path,
            file=f,
            file_options={
                "content-type": "application/jsonl",
                "upsert": False,
            },
        )

    # public url
    return supabase.storage.from_(BUCKET).get_public_url(object_path)
