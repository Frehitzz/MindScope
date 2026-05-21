# MindScope

MindScope is a school-project dashboard built with React, Vite, Supabase, and an optional Express backend for AI/weather features. The dataset is educational/demo data and should not be treated as medical or clinical evidence.

## Run Locally

### Prerequisites

Install these before starting:

- Node.js 20 or newer
- npm
- Python 3.10 or newer, only needed for dataset upload/cleaning scripts
- A Supabase project, if you want the dashboard data to load

### 1. Clone The Project

```powershell
git clone <repository-url>
cd MindScope
```

### 2. Configure The Frontend Environment

Create `frontend/.env` from the example file:

```powershell
cd frontend
copy .env.example .env
```

Update `frontend/.env` with your Supabase values:

```env
VITE_SUPABASE_URL=your-supabase-project-url
VITE_SUPABASE_ANON_KEY=your-public-anon-key
VITE_BACKEND_URL=http://localhost:3001
```

Only use browser-safe public values in `frontend/.env`. Do not put a Supabase service-role key in the frontend environment file.

### 3. Install And Run The Frontend

From the `frontend/` folder:

```powershell
npm install
npm run dev
```

Open the local Vite URL shown in the terminal. By default, it is usually:

```text
http://localhost:5173
```

### 4. Run The Backend

The backend is required for AI and weather features. In a second terminal, from the project root:

```powershell
cd backend
copy .env.example .env
npm install
npm run dev
```

Update `backend/.env` before using AI features:

```env
GROQ_API_KEY=your-groq-api-key
FRONTEND_ORIGIN=http://localhost:5173
```

The backend runs on:

```text
http://localhost:3001
```

You can verify it is running by opening:

```text
http://localhost:3001/health
```

## Supabase And Dataset Setup

The frontend expects these public database surfaces:

- `public_teen_mental_health_table`
- `get_dashboard_kpis()`
- `get_platform_addiction_summary()`
- `get_interaction_depression_summary()`
- `get_usage_depression_summary()`

### 1. Create Database Objects

Run these files in the Supabase SQL Editor:

1. `docs/creating-table.md`
2. `docs/dashboard-aggregate-rpcs.sql`
3. `docs/data-table-public-view-setup.md`

### 2. Configure Script Environment

Create `data/.env` from the example file:

```powershell
cd C:\Mycodes\MindScope\data
copy .env.example .env
```

Update `data/.env`:

```env
SUPABASE_URL=your-supabase-project-url
SUPABASE_KEY=your-supabase-service-role-or-api-key
SUPABASE_TABLE_NAME=teen_mental_health
SUPABASE_CLEANED_TABLE_NAME=teen_mental_health_cleaned
UPLOAD_CHUNK_SIZE=200
```

### 3. Install Python Dependencies

From the project root:

```powershell
pip install pandas requests python-dotenv
```

### 4. Upload And Clean The Dataset

From the project root:

```powershell
python data/upload_to_supabase.py
python data/run_cleaning_pipeline.py
```

The cleaning pipeline reads `data/Teen_Mental_Health_Dataset.csv` and writes cleaned records to `teen_mental_health_cleaned`.

### 5. Verify The Database

Run this in the Supabase SQL Editor:

```sql
select count(*) from public.teen_mental_health_cleaned;
select count(*) from public.public_teen_mental_health_table;
```

For the included dataset, both counts should normally be `1000`.

## Common Commands

Frontend commands, run from `frontend/`:

```powershell
npm run dev
npm run build
npm run lint
npm run preview
```

Backend commands, run from `backend/`:

```powershell
npm run dev
npm start
```

## Project Structure

```text
MindScope/
  backend/    Express backend for AI and weather endpoints
  data/       CSV dataset and Supabase upload/cleaning scripts
  docs/       Supabase SQL and privacy/RLS notes
  frontend/   React + Vite frontend
```

## Deployment Roots

- Vercel frontend root: `frontend/`
- Render backend root: `backend/`

## Notes

- The dashboard and insight pages read aggregate data through Supabase RPC functions.
- The data table reads from `public_teen_mental_health_table` instead of the raw cleaned table.
- See `docs/privacy-and-rls-boundaries.md` for the current privacy and RLS boundary.
