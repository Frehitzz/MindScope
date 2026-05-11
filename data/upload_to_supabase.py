from __future__ import annotations

import math

import pandas as pd
import requests
from requests import HTTPError


def upload_dataframe_to_supabase(
    df: pd.DataFrame,
    *,
    supabase_url: str,
    supabase_key: str,
    table_name: str,
    chunk_size: int = 200,
    clear_first: bool = False,
) -> None:
    # build the destination url
    endpoint_url = f"{supabase_url.rstrip('/')}/rest/v1/{table_name}"

    # clear the table if requested to prevent duplicates
    if clear_first:
        print(f"Clearing existing records in '{table_name}' to prevent duplicates...")
        delete_url = f"{endpoint_url}?id=gte.0"  # deletes all rows where id >= 0
        delete_headers = {
            "apikey": supabase_key,
            "Authorization": f"Bearer {supabase_key}",
        }
        del_resp = requests.delete(delete_url, headers=delete_headers, timeout=30)
        try:
            del_resp.raise_for_status()
        except HTTPError as exc:
            message = del_resp.text.strip() or str(exc)
            raise RuntimeError(f"Failed to clear table '{table_name}': {message}") from exc

    # convert dataframe to a list of dictionaries handling null values
    records = df.where(pd.notnull(df), None).to_dict(orient="records")
    total_records = len(records)
    total_chunks = math.ceil(total_records / chunk_size) if total_records else 0

    # setup the headers for the api request
    headers = {
        "apikey": supabase_key,
        "Authorization": f"Bearer {supabase_key}",
        "Content-Type": "application/json",
        "Prefer": "return=minimal",
    }

    # loop through the data and upload in chunks
    for index in range(0, total_records, chunk_size):
        chunk = records[index:index + chunk_size]
        current_chunk = (index // chunk_size) + 1
        print(f"Uploading chunk {current_chunk}/{total_chunks} ({len(chunk)} records)...")
        response = requests.post(endpoint_url, headers=headers, json=chunk, timeout=30)
        
        # stop the script and show error if upload fails
        try:
            response.raise_for_status()
        except HTTPError as exc:
            message = response.text.strip() or str(exc)
            raise RuntimeError(
                f"Supabase upload failed for table '{table_name}': {message}"
            ) from exc


def main() -> None:
    from config import load_settings
    
    settings = load_settings()
    csv_path = str(settings["csv_path"])
    
    if not settings["supabase_url"] or not settings["supabase_key"]:
        raise RuntimeError("Missing SUPABASE_URL or SUPABASE_KEY in .env")

    print(f"Reading dataset from {csv_path}...")
    df = pd.read_csv(csv_path)
    
    # upload to the raw table
    print(f"Uploading {len(df)} records to '{settings['source_table_name']}'...")
    upload_dataframe_to_supabase(
        df,
        supabase_url=str(settings["supabase_url"]),
        supabase_key=str(settings["supabase_key"]),
        table_name=str(settings["source_table_name"]),
        chunk_size=int(settings["upload_chunk_size"]),
        clear_first=True,
    )
    
    print(f"\nSuccess! Raw data uploaded to '{settings['source_table_name']}'.")
    print("Next step: run 'python data/run_cleaning_pipeline.py' to populate the cleaned table.")


if __name__ == "__main__":
    main()
