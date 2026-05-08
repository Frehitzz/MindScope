# MindScope Codebase Audit

Audit date: 2026-05-08

Scope: React/Vite frontend, Supabase client usage, dataset cleaning/upload scripts, project configuration, documentation, and configured quality checks.

## Executive Summary

The app now builds successfully and passes lint. The main remaining best-practice gaps are missing automated tests, no declared Python dependency file, row-level privacy hardening for the public data table path, duplicated summary/insight logic, and runtime hardening work.

This project is usable as a school/demo dashboard, but it should not be treated as production-ready until the high-priority findings below are fixed.

## Task Board

Use this section as the working tracker for what is done, what is partially done, and what should be tackled next.

- [x] Task 1: Fix lint failures
  `npm run lint` passes after typing/chart and pagination-state fixes.
- [x] Task 2: Add typed Supabase schema and shared row types
  Implemented in `src/types/` and wired into the Supabase client/pages.
- [x] Task 3: Complete server-side data fetching for the whole app
  `DataTablePage` is server-driven now, and `DashboardPage`/`InsightPage` now consume aggregate RPCs instead of raw-row datasets.
- [x] Task 4: Document privacy and RLS boundaries
  Added [docs/privacy-and-rls-boundaries.md](/C:/Mycodes/MindScope/docs/privacy-and-rls-boundaries.md:1) and a safe `.env.example` for frontend setup.
- [ ] Task 5: Extract shared analytics module
  Dashboard and insight logic is still duplicated.
- [ ] Task 6: Add automated frontend and Python tests
  No test runner or test files yet.
- [ ] Task 7: Add Python dependency declaration
  `requirements.txt` or `pyproject.toml` is still missing.
- [ ] Task 8: Make dataset uploads idempotent
  Re-running uploads can still duplicate rows.
- [ ] Task 9: Reduce production bundle size
  Bundle is still large and `xlsx` is still imported in the route.
- [ ] Task 10: Clean encoding artifacts in UI strings
  Text corruption still exists in a few files.
- [ ] Task 11: Remove or formalize hardcoded demo UI values
  Topbar and sidebar still contain placeholders.
- [ ] Task 12: Improve runtime error handling
  Missing env/data failures still need better user-facing handling.

## What Is Solved

- `npm run lint` now passes.
- Supabase client typing is in place with shared row aliases.
- `DataTablePage` no longer fetches the full dataset just to paginate/filter in the browser.
- `DataTablePage` now uses server-side pagination, sorting, filtering, and export queries.
- `DashboardPage` and `InsightPage` now use aggregate RPC functions instead of browser-side raw-row aggregation.
- Privacy/RLS boundaries are now documented, with a safe frontend `.env.example`.
- Interaction filter case mismatch was fixed.
- Toolbar clear-button flicker/layout shift was fixed.

## Next Recommended Task

The next highest-value task is:

`Task 5: extract the remaining shared analytics/module boundaries and add tests`

Why this should be next:

- task 3 and task 4 are now documented and implemented at the data-boundary level
- the next remaining risk is duplicated analytics logic and missing tests
- it improves maintainability before more features are added

Concrete next step:

- extract the shared aggregate formatting or analytics helpers into a narrower reusable module
- add tests around aggregate result mapping and table/query behavior

## Verification Results

| Check | Result | Notes |
| --- | --- | --- |
| `npm run build` | Passed | Production bundle generates successfully. Vite still warns that the main JS chunk is large. |
| `npm run lint` | Passed | The previous explicit `any` and React Hooks lint failures have been fixed. |
| `npm audit --omit=dev` | Passed | No production dependency vulnerabilities reported locally. |

## High Priority Findings

### 1. Lint currently fails

Status: Done

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

Status: Done

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

Status: Done

Evidence:

- `src/pages/DashboardPage.tsx` now reads aggregate RPC results through `src/lib/dashboardAggregates.ts`.
- `src/pages/InsightPage.tsx` now reads aggregate RPC results through `src/lib/dashboardAggregates.ts`.
- `src/pages/DataTablePage.tsx:51` fetches the full table, then filters, sorts, paginates, and exports client-side.

Impact:

This is acceptable for a 1,000-row demo dataset, but it becomes slow, expensive, and risky as data grows. It also exposes every selected row to the browser, including row-level records used for export.

Suggested fix:

- Move dashboard aggregations into Supabase SQL views or RPC functions.
- Use server-side pagination, sorting, and filtering for the table via `.range()`, `.order()`, and query filters.
- Restrict exported fields to non-sensitive columns and require explicit user intent if this will ever contain real student data.

Progress:

- `DataTablePage` now uses server-side pagination, sorting, filtering, and export queries.
- `DashboardPage` and `InsightPage` now use aggregate RPC functions instead of raw-row browser aggregation.

### 4. Data access and privacy rules are not documented or enforced in code

Status: Done

Evidence:

- Browser code uses the anon key for frontend reads and aggregate RPCs.
- [docs/privacy-and-rls-boundaries.md](/C:/Mycodes/MindScope/docs/privacy-and-rls-boundaries.md:1) now documents the intended `anon` vs `service_role` boundary and the remaining row-level risk in `DataTablePage`.

Impact:

If this project is connected to real or sensitive student wellbeing data, direct browser access can leak row-level information unless Supabase Row Level Security policies are strict.

Implemented documentation:

- Added `docs/privacy-and-rls-boundaries.md` with recommended RLS posture and role boundaries.
- Added `.env.example` containing only public frontend variables.
- Documented that aggregate RPCs are the preferred public data surface and that `DataTablePage` remains a demo-only row-level boundary unless stricter RLS is added.

## Medium Priority Findings

### 5. Aggregation logic is duplicated across dashboard and insight pages

Status: Pending

Evidence:

- Platform, interaction, and hourly depression calculations are implemented in both `DashboardPage.tsx` and `InsightPage.tsx`.

Impact:

Any formula change must be made in multiple places. This increases the chance that charts and insight summaries drift apart.

Suggested fix:

- Extract a shared `src/lib/analytics.ts` module with pure functions such as `groupAddictionByPlatform`, `groupDepressionByInteraction`, and `groupDepressionByUsageHour`.
- Add unit tests for those pure functions.

### 6. No automated test setup exists

Status: Pending

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

Status: Pending

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

Status: Pending

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

Status: Pending

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

Status: Pending

Evidence:

- `src/pages/DashboardPage.tsx` comments render `â€”`.
- `src/components/Topbar.tsx` renders `28Â°C`.
- `src/components/Sidebar.tsx` renders `Jan â€“ May 2026`.

Impact:

This looks unpolished and may confuse users.

Suggested fix:

- Replace corrupted characters with plain ASCII (`-`, `28 C`) or ensure files are saved as UTF-8.

### 11. Hardcoded demo-only UI values are mixed into application chrome

Status: Pending

Evidence:

- `src/components/Topbar.tsx` hardcodes weather and avatar values.
- `src/components/Sidebar.tsx` hardcodes survey period.

Impact:

Users may mistake static placeholder values for live or configured data.

Suggested fix:

- Move these values into a config object, remove them, or clearly label them as demo placeholders.

### 12. Runtime error handling is minimal

Status: Pending

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

1. Extract duplicated analytics calculations into a tested utility module.
2. Add frontend unit tests for analytics and table behavior.
3. Add Python dependency declaration and pytest coverage for cleaning.
4. Make uploads idempotent.
5. Reduce row-level public exposure in `DataTablePage` if the project moves beyond demo data.
6. Code-split `xlsx`, chart-heavy routes, and large page modules.

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
