# MindScope Setup

MindScope is a school-project dashboard built on a teen mental health dataset. The dataset should be treated as educational/demo data, not as medical or clinical evidence.

## Project Data Flow

The app now uses two different public data surfaces:

- `DashboardPage` and `InsightPage` read aggregate data through Supabase RPC functions
- `DataTablePage` reads a reduced public view instead of the raw cleaned table

Current intended boundary:

- raw cleaned table: `teen_mental_health_cleaned`
- public table view: `public_teen_mental_health_table`
- public dashboard RPCs:
  - `get_dashboard_kpis()`
  - `get_platform_addiction_summary()`
  - `get_interaction_depression_summary()`
  - `get_usage_depression_summary()`

## Dataset Files

- CSV source: `data/Teen_Mental_Health_Dataset.csv`
- Upload script: `data/upload_to_supabase.py`
- Base table SQL: `docs/creating-table.md`
- Dashboard RPC SQL: `docs/dashboard-aggregate-rpcs.sql`
- Public table view setup: `docs/data-table-public-view-setup.md`
- Privacy/RLS notes: `docs/privacy-and-rls-boundaries.md`

## What The Dataset Contains

The original CSV has `1000` rows and these columns:

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

## 1. Setup Checklist

To set up the project from scratch in a new Supabase instance, follow these steps in order:

| Order | Task | Tool | File / Command |
| :--- | :--- | :--- | :--- |
| **1** | Create Base Tables | SQL Editor | [docs/creating-table.md](/C:/Mycodes/MindScope/docs/creating-table.md:1) |
| **2** | Set Up Dashboard RPCs | SQL Editor | [docs/dashboard-aggregate-rpcs.sql](/C:/Mycodes/MindScope/docs/dashboard-aggregate-rpcs.sql:1) |
| **3** | Set Up Public View | SQL Editor | [docs/data-table-public-view-setup.md](/C:/Mycodes/MindScope/docs/data-table-public-view-setup.md:1) |
| **4** | Upload Raw Data | Terminal | `python data/upload_to_supabase.py` |
| **5** | Run Cleaning Pipeline | Terminal | `python data/run_cleaning_pipeline.py` |

---

## 2. Detailed Setup Steps

### 2.1 Create The Base Tables

- [docs/creating-table.md](/C:/Mycodes/MindScope/docs/creating-table.md:1)

Main tables:

```sql
teen_mental_health
teen_mental_health_cleaned
```

### 2.2 Install Python Requirements

The upload and cleaning scripts depend on:

```txt
pandas
requests
python-dotenv
```

Install them with:

```powershell
pip install pandas requests python-dotenv
```

### 2.3 Configure Environment Variables

### Dataset/script environment

Create a `.env` file in the `data` folder with:

```env
SUPABASE_URL=your-supabase-project-url
SUPABASE_KEY=your-supabase-service-role-or-api-key
```

The Python scripts read:

- `SUPABASE_URL`
- `SUPABASE_KEY`

### Frontend environment

Frontend environment files should contain only browser-safe public values:

```env
VITE_SUPABASE_URL=your-supabase-project-url
VITE_SUPABASE_ANON_KEY=your-public-anon-key
```

Use:

- [frontend/.env.example](/C:/Mycodes/MindScope/frontend/.env.example:1)

Do not place service-role secrets in frontend env files.

### 2.4 Upload The Dataset

Run the uploader from the project root to populate the raw table:

```powershell
python data/upload_to_supabase.py
```

### 2.5 Run The Cleaning Pipeline

After uploading the raw data, run the cleaning pipeline to populate the dashboard data:

```powershell
python data/run_cleaning_pipeline.py
```

The cleaning script will:
- read `data/Teen_Mental_Health_Dataset.csv`
- perform data cleaning and validation
- upload the processed records to `teen_mental_health_cleaned`

## Deployment Roots

Current deployment structure:

- Vercel frontend root: `frontend/`
- Render backend root: `backend/`

Frontend build files now live under:

- [frontend/package.json](/C:/Mycodes/MindScope/frontend/package.json:1)
- [frontend/vercel.json](/C:/Mycodes/MindScope/frontend/vercel.json:1)

The backend folder is reserved for the future Express service and should be used as the Render root when the backend code is added.

> [!NOTE]
> **No Duplicates**: The upload scripts are safe to rerun. They will automatically clear their respective tables before uploading the fresh data, preventing duplicate records.


### 2.6 Configure Public Dashboard Access

To make the dashboard and insight pages work with RLS enabled, run:

- [docs/dashboard-aggregate-rpcs.sql](/C:/Mycodes/MindScope/docs/dashboard-aggregate-rpcs.sql:1)

That file creates the public aggregate RPCs with:

- `security definer`
- `set search_path = public`
- `grant execute ... to anon`

This is what allows public aggregate reads without opening raw table access to the browser.

### 2.7 Configure Public Data Table Access

To make `DataTablePage` work without exposing the full raw cleaned table, run the view setup from:

- [docs/data-table-public-view-setup.md](/C:/Mycodes/MindScope/docs/data-table-public-view-setup.md:1)

That setup creates:

```sql
public_teen_mental_health_table
```

This view exposes only the columns the table page needs:

- `id`
- `gender`
- `social_interaction_level`
- `daily_social_media_hours`
- `platform_usage`
- `depression_label`

The frontend is already configured to read from this view.

### 2.8 Verify The Database State

After setup, verify these counts in Supabase SQL Editor:

```sql
select count(*) from public.teen_mental_health_cleaned;
select count(*) from public.public_teen_mental_health_table;
```

Expected:

- both counts should match each other
- if the original dataset was loaded once, they should normally be `1000`

If you see `3000` or another larger number, that usually means the cleaned dataset was uploaded multiple times. The public view does not create duplicate rows; it only reflects the source table.

### 2.9 Run The Frontend

Run the frontend from the `frontend/` folder:

```powershell
cd frontend
npm run dev
```

Expected behavior:

- dashboard cards and charts load from aggregate RPCs
- insight summaries load from aggregate RPCs
- data table loads from `public_teen_mental_health_table`

## Notes

- This dataset is for school-project use.
- Do not describe it as a real diagnostic or clinical dataset unless you have a verified source.
- If you rerun the upload script against the same destination table, it may insert duplicate logical rows unless you clear the table first.
- For the current demo architecture, the dashboard should use aggregate RPCs and the table should use the reduced public view rather than direct raw-table browser reads.
- See [docs/privacy-and-rls-boundaries.md](/C:/Mycodes/MindScope/docs/privacy-and-rls-boundaries.md:1) for the current RLS and privacy boundary.
