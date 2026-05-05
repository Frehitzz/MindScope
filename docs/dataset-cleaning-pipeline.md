# Dataset Cleaning Pipeline

This project now uses a split Python pipeline in `dataset/` instead of keeping all logic in one file.

## Setup Requirements

Before running the pipeline, make sure these pieces are in place:

- Python 3 is installed
- The required Python packages are installed:

```powershell
pip install pandas requests python-dotenv
```

- The source dataset exists at:

```text
dataset/Teen_Mental_Health_Dataset.csv
```

- Supabase credentials are available in:

```text
dataset/.env
```

- The destination Supabase table for cleaned data has been created

## Files

- `dataset/config.py`
  Loads file paths, Supabase credentials, table names, and upload settings.
- `dataset/cleaning.py`
  Handles missing values, normalizes one numeric column, and filters outliers.
- `dataset/upload_to_supabase.py`
  Uploads the cleaned dataset to Supabase in chunks.
- `dataset/run_cleaning_pipeline.py`
  Runs the full workflow end to end.

## What The Pipeline Does

### 1. Handle missing or null values

The script checks every column and records the strategy used for that column in `dataset/cleaning_summary.json`.

- Numeric columns:
  Missing values are flagged in a new column named `<column>_was_missing`, then filled with the column median.
- Categorical columns:
  Missing values are flagged in a new column named `<column>_was_missing`, then filled with the column mode.
- Columns with no missing values:
  The summary records `no_action_needed`, and the `<column>_was_missing` flag stays `0`.

For the current `Teen_Mental_Health_Dataset.csv`, the audit shows no missing values, so the pipeline documents that no fill or drop action was required in this run.

### 2. Normalize a numerical column

The pipeline applies min-max scaling to:

- `daily_social_media_hours`

It creates a new column:

- `daily_social_media_hours_min_max`

Formula used:

```text
(value - min) / (max - min)
```

This scales the values into the `0` to `1` range.

### 3. Filter outliers

The pipeline uses the IQR method on these continuous numeric columns:

- `age`
- `daily_social_media_hours`
- `sleep_hours`
- `screen_time_before_sleep`
- `academic_performance`
- `physical_activity`
- `stress_level`
- `anxiety_level`
- `addiction_level`

For each column:

```text
IQR = Q3 - Q1
Lower bound = Q1 - 1.5 * IQR
Upper bound = Q3 + 1.5 * IQR
```

Any row outside those bounds is removed from the cleaned output.

For the current dataset, the selected continuous columns produce zero removed rows, which means the filter still ran but did not detect any outliers to drop.

## Export Back To Cloud Storage

The cleaned dataset is exported in two places:

- Local cleaned CSV: `dataset/Teen_Mental_Health_Dataset.cleaned.csv`
- Supabase table: `teen_mental_health_cleaned` by default

You can change the destination table with:

```env
SUPABASE_CLEANED_TABLE_NAME=your_table_name
```

## Environment Variables

Put these in `dataset/.env`:

```env
SUPABASE_URL=your-supabase-project-url
SUPABASE_KEY=your-supabase-key
SUPABASE_TABLE_NAME=teen_mental_health
SUPABASE_CLEANED_TABLE_NAME=teen_mental_health_cleaned
UPLOAD_CHUNK_SIZE=200
```

## Supabase Setup

You need two database tables:

- `teen_mental_health`
- `teen_mental_health_cleaned`

Create them with the SQL in:

- `docs/creating-table.md`

The cleaned table is required because the pipeline uploads the processed dataset there instead of overwriting the original raw table.

## Step-By-Step Run Guide

### 1. Install Python packages

From the project root:

```powershell
pip install pandas requests python-dotenv
```

### 2. Create the Supabase tables

Open Supabase SQL Editor and run the SQL from:

```text
docs/creating-table.md
```

This creates both the raw table and the cleaned table.

### 3. Create `dataset/.env`

Add your real Supabase values:

```env
SUPABASE_URL=your-supabase-project-url
SUPABASE_KEY=your-supabase-key
SUPABASE_TABLE_NAME=teen_mental_health
SUPABASE_CLEANED_TABLE_NAME=teen_mental_health_cleaned
UPLOAD_CHUNK_SIZE=200
```

### 4. Confirm the CSV is in the dataset folder

The script expects this file:

```text
dataset/Teen_Mental_Health_Dataset.csv
```

### 5. Run the cleaning pipeline

From the project root:

```powershell
python dataset/run_cleaning_pipeline.py
```

### 6. Check the outputs

After the run finishes, verify:

- `dataset/Teen_Mental_Health_Dataset.cleaned.csv` was created
- `dataset/cleaning_summary.json` was created
- the Supabase table `teen_mental_health_cleaned` contains the uploaded cleaned rows

## How To Run

From the project root:

```powershell
python dataset/run_cleaning_pipeline.py
```

## Outputs

After a successful run you will get:

- `dataset/Teen_Mental_Health_Dataset.cleaned.csv`
- `dataset/cleaning_summary.json`

The JSON summary documents:

- missing-value handling strategy per column
- normalization method and column
- outlier filtering method and row counts
- final row count

## Cleaned Table Note

Because the cleaned dataset adds:

- one normalized column: `daily_social_media_hours_min_max`
- one missing-value flag column for every original dataset column

the destination Supabase table should include those extra columns before upload.
