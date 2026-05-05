from __future__ import annotations

import os
from pathlib import Path

from dotenv import load_dotenv


# set up base directory and file paths
BASE_DIR = Path(__file__).resolve().parent
CSV_PATH = BASE_DIR / "Teen_Mental_Health_Dataset.csv"
CLEANED_CSV_PATH = BASE_DIR / "Teen_Mental_Health_Dataset.cleaned.csv"


def load_settings() -> dict[str, object]:
    # load environment variables from env file
    load_dotenv(BASE_DIR / ".env")
    load_dotenv()

    # return a dictionary with all configuration settings
    return {
        "csv_path": CSV_PATH,
        "cleaned_csv_path": CLEANED_CSV_PATH,
        "supabase_url": os.getenv("SUPABASE_URL"),
        "supabase_key": os.getenv("SUPABASE_KEY"),
        "source_table_name": os.getenv("SUPABASE_TABLE_NAME", "teen_mental_health"),
        "cleaned_table_name": os.getenv(
            "SUPABASE_CLEANED_TABLE_NAME",
            "teen_mental_health_cleaned",
        ),
        "upload_chunk_size": int(os.getenv("UPLOAD_CHUNK_SIZE", "200")),
    }
