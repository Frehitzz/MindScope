# MindScope Codebase Audit

Audit date: 2026-05-08

Scope: React/Vite frontend, Supabase client usage, dataset cleaning/upload scripts, project configuration, documentation, and configured quality checks.

## Executive Summary

The app builds successfully, but it is not currently passing its configured lint gate. The main best-practice gaps are weak TypeScript boundaries around chart/data code, duplicated Supabase aggregation logic, no automated tests, no declared Python dependency file, and client-side fetching/export patterns that will not scale safely if the dataset grows or contains sensitive records.

This project is usable as a school/demo dashboard, but it should not be treated as production-ready until the high-priority findings below are fixed.

## Verification Results

| Check | Result | Notes |
| --- | --- | --- |
| `npm run build` | Passed | Production bundle generated successfully. Vite warns the main JS chunk is large: `981.34 kB` minified, `306.20 kB` gzip. |
| `npm run lint` | Failed | 9 ESLint errors: explicit `any` usage in `DashboardPage.tsx`, and React Hooks `set-state-in-effect` violations in `DataTablePage.tsx`. |
| `npm audit --omit=dev` | Passed | No production dependency vulnerabilities reported locally. |

## High Priority Findings

### 1. Lint currently fails

Evidence:

- `src/pages/DashboardPage.tsx:26`, `:42`, `:63`, `:327`, `:349`, `:362`, `:408` use explicit `any`.
- `src/pages/DataTablePage.tsx:146` and `:151` synchronously call `setCurrentPage` inside effects, which the configured React Hooks lint rules reject.

Impact:

The repository has a quality gate, but it is red. This blocks reliable CI adoption and allows type-safety regressions.

Suggested fix:

- Add explicit Supabase row, chart callback, and plugin option types instead of `any`.
- Replace `setCurrentPage(1)` effect with resetting page directly inside filter/search handlers, or derive a clamped page value during render.
- Replace the `currentPage > totalPages` effect with a derived `safeCurrentPage = Math.min(currentPage, totalPages)`.

### 2. Supabase data shape is not typed

Evidence:

- `src/lib/supabase.ts:10` creates an untyped Supabase client.
- `DashboardPage.tsx`, `InsightPage.tsx`, and `DataTablePage.tsx` cast or infer database rows manually.

Impact:

Column names, nullability, and numeric fields are not enforced at compile time. A schema change in Supabase can silently break calculations or charts.

Suggested fix:

- Generate Supabase database types and initialize the client as `createClient<Database>(...)`.
- Define reusable row types for `teen_mental_health_cleaned`.
- Use typed select result helpers instead of page-local assumptions.

### 3. Frontend fetches full table data and calculates aggregates in the browser

Evidence:

- `src/pages/DashboardPage.tsx:73` selects all rows needed for KPIs and chart aggregations.
- `src/pages/InsightPage.tsx:105` repeats similar full-table aggregation logic.
- `src/pages/DataTablePage.tsx:51` fetches the full table, then filters, sorts, paginates, and exports client-side.

Impact:

This is acceptable for a 1,000-row demo dataset, but it becomes slow, expensive, and risky as data grows. It also exposes every selected row to the browser, including row-level records used for export.

Suggested fix:

- Move dashboard aggregations into Supabase SQL views or RPC functions.
- Use server-side pagination, sorting, and filtering for the table via `.range()`, `.order()`, and query filters.
- Restrict exported fields to non-sensitive columns and require explicit user intent if this will ever contain real student data.

### 4. Data access and privacy rules are not documented or enforced in code

Evidence:

- Browser code reads `teen_mental_health_cleaned` directly using the anon key.
- The README correctly says the dataset is educational/demo, but there is no RLS policy documentation or privacy boundary in the app.

Impact:

If this project is connected to real or sensitive student wellbeing data, direct browser access can leak row-level information unless Supabase Row Level Security policies are strict.

Suggested fix:

- Ensure RLS is enabled on Supabase tables.
- Add policy documentation under `docs/` that states which roles can read aggregate data and row-level data.
- Prefer public aggregate views for the dashboard and protect raw-row access.
- Add `.env.example` with only public Vite anon-key variables for frontend setup.

## Medium Priority Findings

### 5. Aggregation logic is duplicated across dashboard and insight pages

Evidence:

- Platform, interaction, and hourly depression calculations are implemented in both `DashboardPage.tsx` and `InsightPage.tsx`.

Impact:

Any formula change must be made in multiple places. This increases the chance that charts and insight summaries drift apart.

Suggested fix:

- Extract a shared `src/lib/analytics.ts` module with pure functions such as `groupAddictionByPlatform`, `groupDepressionByInteraction`, and `groupDepressionByUsageHour`.
- Add unit tests for those pure functions.

### 6. No automated test setup exists

Evidence:

- `package.json` has `dev`, `build`, `lint`, and `preview`, but no `test` script.
- There are no test files in the repository.

Impact:

Core calculations, filters, sort logic, export mapping, and data-cleaning behavior can regress without detection.

Suggested fix:

- Add Vitest and React Testing Library for frontend tests.
- Add tests for analytics functions and `DataTablePage` filter/sort/pagination behavior.
- Add pytest for `dataset/cleaning.py`, especially missing-value handling, normalization, and IQR filtering.

### 7. Python dependencies are documented but not declared

Evidence:

- `dataset/config.py:6` imports `dotenv`.
- `dataset/cleaning.py` imports `pandas`.
- `dataset/upload_to_supabase.py` imports `requests`.
- README lists these packages, but there is no `requirements.txt`, `pyproject.toml`, or lock file.

Impact:

The dataset pipeline is not reproducible from the repository alone.

Suggested fix:

- Add `dataset/requirements.txt` or a root `pyproject.toml`.
- Include at least `pandas`, `requests`, and `python-dotenv`.
- Add a short command in README: `pip install -r dataset/requirements.txt`.

### 8. Upload pipeline can duplicate data

Evidence:

- README notes rerunning uploads may insert duplicate logical rows.
- `dataset/upload_to_supabase.py` uses plain `POST` inserts with no upsert, truncate, or idempotency strategy.

Impact:

Repeated pipeline runs can corrupt dashboard metrics by duplicating records.

Suggested fix:

- Add an explicit mode: `insert`, `upsert`, or `replace`.
- Prefer upsert on a stable primary key or clear the destination table in a controlled transaction before inserting.
- Include row-count validation after upload.

### 9. Production bundle is large

Evidence:

- `npm run build` reports `dist/assets/index-*.js` at `981.34 kB` minified.
- `src/pages/DataTablePage.tsx:3` imports `xlsx` in the main route bundle.

Impact:

Users download the spreadsheet library even if they never open or export from the data table.

Suggested fix:

- Lazy-load route pages with `React.lazy`.
- Dynamically import `xlsx` inside `handleExport`.
- Consider splitting Chart.js route code from the initial dashboard shell.

## Low Priority Findings

### 10. Some UI strings show encoding artifacts

Evidence:

- `src/pages/DashboardPage.tsx` comments render `â€”`.
- `src/components/Topbar.tsx` renders `28Â°C`.
- `src/components/Sidebar.tsx` renders `Jan â€“ May 2026`.

Impact:

This looks unpolished and may confuse users.

Suggested fix:

- Replace corrupted characters with plain ASCII (`-`, `28 C`) or ensure files are saved as UTF-8.

### 11. Hardcoded demo-only UI values are mixed into application chrome

Evidence:

- `src/components/Topbar.tsx` hardcodes weather and avatar values.
- `src/components/Sidebar.tsx` hardcodes survey period.

Impact:

Users may mistake static placeholder values for live or configured data.

Suggested fix:

- Move these values into a config object, remove them, or clearly label them as demo placeholders.

### 12. Runtime error handling is minimal

Evidence:

- `src/lib/supabase.ts` throws during module import if env variables are missing.
- Dashboard and insight pages log errors but do not show a consistent user-facing error state.

Impact:

Missing configuration can crash the app before it renders. Runtime data failures are inconsistent across pages.

Suggested fix:

- Add a shared error/empty/loading component pattern.
- Validate env at startup and render a clear setup message for missing public config.
- Avoid relying on `console.error` as the primary failure path.

## Recommended Fix Order

1. Fix the lint errors so `npm run lint` passes.
2. Add typed Supabase schema support and shared row types.
3. Extract duplicated analytics calculations into a tested utility module.
4. Add frontend unit tests for analytics and table behavior.
5. Add Python dependency declaration and pytest coverage for cleaning.
6. Move dashboard/table aggregations and pagination closer to Supabase.
7. Add RLS/privacy documentation before using non-demo data.
8. Code-split `xlsx`, chart-heavy routes, and large page modules.

## Suggested CI Gate

Add a CI workflow that runs:

```powershell
npm ci
npm run lint
npm run build
```

If Python pipeline work is part of the project deliverable, also run:

```powershell
pip install -r dataset/requirements.txt
pytest
```
