# MindScope Dataset Setup

This project uses a teen mental health dataset for a school project. The dataset should be treated as an educational/demo dataset, not as medical or clinical evidence.

## Dataset Files

- CSV source: `dataset/Teen_Mental_Health_Dataset.csv`
- Upload script: `dataset/upload_to_supabase.py`
- Table SQL: `docs/creating-table.md`

## What The Dataset Contains

The CSV has 1000 rows and these columns:

- `age`
- `gender`
- `daily_social_media_hours`
- `platform_usage`
- `sleep_hours`
- `screen_time_before_sleep`
- `academic_performance`
- `physical_activity`
- `social_interaction_level`
- `stress_level`
- `anxiety_level`
- `addiction_level`
- `depression_label`

## 1. Create The Database Table

Create a table in Supabase using the SQL in [docs/creating-table.md](/abs/path/C:/Mycodes/MindScope/docs/creating-table.md:1).

Current table name:

```sql
teen_mental_health
```

## 2. Install Python Requirements

The upload script depends on:

```txt
pandas
requests
python-dotenv
```

Install them with:

```powershell
pip install pandas requests python-dotenv
```

## 3. Configure Environment Variables

Create a `.env` file in the project root or in the `dataset` folder with:

```env
SUPABASE_URL=your-supabase-project-url
SUPABASE_KEY=your-supabase-service-role-or-api-key
```

The script reads:

- `SUPABASE_URL`
- `SUPABASE_KEY`

## 4. Upload The Dataset

Run the uploader from the project root:

```powershell
python dataset/upload_to_supabase.py
```

The script will:

- read `dataset/Teen_Mental_Health_Dataset.csv`
- convert rows to JSON records
- insert data into Supabase in chunks of 200

## 5. Verify The Upload

After the script finishes:

1. Open your Supabase dashboard.
2. Go to the `teen_mental_health` table.
3. Confirm the row count matches the CSV.

Expected row count:

```txt
1000
```

## Notes

- This dataset is for school-project use.
- Do not describe it as a real diagnostic or clinical dataset unless you have a verified source.
- If you rerun the upload script against the same table, it may insert duplicate logical rows unless you clear the table first.
