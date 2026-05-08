from __future__ import annotations

import json
from pathlib import Path

from cleaning import clean_dataset, load_dataset
from config import load_settings
from upload_to_supabase import upload_dataframe_to_supabase


def build_run_summary(settings: dict[str, object], cleaning_result) -> dict[str, object]:
    # create a dictionary summarizing the cleaning process
    return {
        "source_csv": str(settings["csv_path"]),
        "cleaned_csv": str(settings["cleaned_csv_path"]),
        "cloud_destination_table": settings["cleaned_table_name"],
        "missing_value_strategy": cleaning_result.missing_value_summary,
        "normalization": cleaning_result.normalization_summary,
        "outlier_filtering": cleaning_result.outlier_summary,
        "final_row_count": int(len(cleaning_result.cleaned_df)),
    }


def write_run_summary(summary: dict[str, object], output_path: Path) -> None:
    # save the summary dictionary to a json file
    output_path.write_text(json.dumps(summary, indent=2), encoding="utf-8")


def main() -> None:
    # load settings and file paths
    settings = load_settings()
    csv_path = Path(settings["csv_path"])
    cleaned_csv_path = Path(settings["cleaned_csv_path"])
    summary_path = Path(__file__).resolve().parent / "cleaning_summary.json"

    # stop if database keys are missing
    if not settings["supabase_url"] or not settings["supabase_key"]:
        raise RuntimeError(
            "Missing SUPABASE_URL or SUPABASE_KEY. Set them in dataset/.env or the environment."
        )

    # load the raw data and clean it
    df = load_dataset(str(csv_path))
    cleaning_result = clean_dataset(df)
    
    # save the cleaned data to a new csv file
    cleaning_result.cleaned_df.to_csv(cleaned_csv_path, index=False)
    
    # create a summary report of the cleaning process
    write_run_summary(build_run_summary(settings, cleaning_result), summary_path)

    # securely upload the cleaned chunks to supabase
    upload_dataframe_to_supabase(
        cleaning_result.cleaned_df,
        supabase_url=str(settings["supabase_url"]),
        supabase_key=str(settings["supabase_key"]),
        table_name=str(settings["cleaned_table_name"]),
        chunk_size=int(settings["upload_chunk_size"]),
        clear_first=True,
    )

    print(f"Cleaned CSV written to {cleaned_csv_path}")
    print(f"Cleaning summary written to {summary_path}")
    print(f"Uploaded cleaned records to Supabase table '{settings['cleaned_table_name']}'")


if __name__ == "__main__":
    main()
