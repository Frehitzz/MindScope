from __future__ import annotations

from dataclasses import dataclass

import pandas as pd


CONTINUOUS_COLUMNS = [
    "age",
    "daily_social_media_hours",
    "sleep_hours",
    "screen_time_before_sleep",
    "academic_performance",
    "physical_activity",
    "stress_level",
    "anxiety_level",
    "addiction_level",
]

NORMALIZED_COLUMN = "daily_social_media_hours"
NORMALIZED_OUTPUT_COLUMN = "daily_social_media_hours_min_max"


@dataclass
class CleaningResult:
    cleaned_df: pd.DataFrame
    missing_value_summary: list[dict[str, object]]
    normalization_summary: dict[str, object]
    outlier_summary: dict[str, object]


def load_dataset(csv_path: str) -> pd.DataFrame:
    return pd.read_csv(csv_path)


def handle_missing_values(df: pd.DataFrame) -> tuple[pd.DataFrame, list[dict[str, object]]]:
    cleaned_df = df.copy()
    summary: list[dict[str, object]] = []

    for column in cleaned_df.columns:
        missing_count = int(cleaned_df[column].isna().sum())
        flag_column = f"{column}_was_missing"
        cleaned_df[flag_column] = cleaned_df[column].isna().astype(int)
        strategy = "no_action_needed"
        fill_value = None

        if missing_count > 0:
            if pd.api.types.is_numeric_dtype(cleaned_df[column]):
                fill_value = float(cleaned_df[column].median())
                cleaned_df[column] = cleaned_df[column].fillna(fill_value)
                strategy = "flag_and_fill_with_median"
            else:
                mode_series = cleaned_df[column].mode(dropna=True)
                fill_value = mode_series.iloc[0] if not mode_series.empty else "Unknown"
                cleaned_df[column] = cleaned_df[column].fillna(fill_value)
                strategy = "flag_and_fill_with_mode"

        summary.append(
            {
                "column": column,
                "missing_count": missing_count,
                "strategy": strategy,
                "fill_value": fill_value,
            }
        )

    return cleaned_df, summary


def normalize_column_min_max(df: pd.DataFrame, column: str, output_column: str) -> tuple[pd.DataFrame, dict[str, object]]:
    cleaned_df = df.copy()
    minimum = float(cleaned_df[column].min())
    maximum = float(cleaned_df[column].max())
    denominator = maximum - minimum

    if denominator == 0:
        cleaned_df[output_column] = 0.0
    else:
        cleaned_df[output_column] = (cleaned_df[column] - minimum) / denominator

    return cleaned_df, {
        "method": "min_max_scaling",
        "source_column": column,
        "output_column": output_column,
        "minimum": minimum,
        "maximum": maximum,
    }


def filter_outliers_iqr(df: pd.DataFrame, columns: list[str]) -> tuple[pd.DataFrame, dict[str, object]]:
    mask = pd.Series(False, index=df.index)
    bounds: dict[str, dict[str, float]] = {}

    for column in columns:
        q1 = float(df[column].quantile(0.25))
        q3 = float(df[column].quantile(0.75))
        iqr = q3 - q1
        lower_bound = q1 - (1.5 * iqr)
        upper_bound = q3 + (1.5 * iqr)
        bounds[column] = {
            "q1": q1,
            "q3": q3,
            "iqr": iqr,
            "lower_bound": lower_bound,
            "upper_bound": upper_bound,
        }
        mask = mask | (df[column] < lower_bound) | (df[column] > upper_bound)

    filtered_df = df.loc[~mask].reset_index(drop=True)

    return filtered_df, {
        "method": "iqr",
        "checked_columns": columns,
        "rows_removed": int(mask.sum()),
        "rows_remaining": int(len(filtered_df)),
        "bounds": bounds,
    }


def clean_dataset(df: pd.DataFrame) -> CleaningResult:
    missing_handled_df, missing_value_summary = handle_missing_values(df)
    normalized_df, normalization_summary = normalize_column_min_max(
        missing_handled_df,
        NORMALIZED_COLUMN,
        NORMALIZED_OUTPUT_COLUMN,
    )
    filtered_df, outlier_summary = filter_outliers_iqr(normalized_df, CONTINUOUS_COLUMNS)

    return CleaningResult(
        cleaned_df=filtered_df,
        missing_value_summary=missing_value_summary,
        normalization_summary=normalization_summary,
        outlier_summary=outlier_summary,
    )
