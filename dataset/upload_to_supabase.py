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
) -> None:
    records = df.where(pd.notnull(df), None).to_dict(orient="records")
    total_records = len(records)
    total_chunks = math.ceil(total_records / chunk_size) if total_records else 0

    headers = {
        "apikey": supabase_key,
        "Authorization": f"Bearer {supabase_key}",
        "Content-Type": "application/json",
        "Prefer": "return=minimal",
    }
    endpoint_url = f"{supabase_url.rstrip('/')}/rest/v1/{table_name}"

    for index in range(0, total_records, chunk_size):
        chunk = records[index:index + chunk_size]
        current_chunk = (index // chunk_size) + 1
        print(f"Uploading chunk {current_chunk}/{total_chunks} ({len(chunk)} records)...")
        response = requests.post(endpoint_url, headers=headers, json=chunk, timeout=30)
        try:
            response.raise_for_status()
        except HTTPError as exc:
            message = response.text.strip() or str(exc)
            raise RuntimeError(
                f"Supabase upload failed for table '{table_name}': {message}"
            ) from exc
