# Task 3: Server-Side Dashboard and Insight Aggregates

Date: 2026-05-08

## What was wrong before this change

Before this fix, both dashboard pages were pulling raw rows from `teen_mental_health_cleaned` into the browser and then calculating aggregates in React.

Affected files before the fix:

- [frontend/src/pages/DashboardPage.tsx](/C:/Mycodes/MindScope/frontend/src/pages/DashboardPage.tsx:1)
- [frontend/src/pages/InsightPage.tsx](/C:/Mycodes/MindScope/frontend/src/pages/InsightPage.tsx:1)

The old pattern looked like this:

1. Fetch many row-level records from Supabase.
2. Loop through those rows in the frontend.
3. Calculate KPI averages, platform addiction summaries, interaction depression rates, and usage-hour depression rates in the browser.
4. Render charts and insight text from those browser-side calculations.

This worked for a small demo dataset, but it is the wrong direction for a scalable dashboard.

## Why we needed to fix it

This needed to be fixed for three practical reasons:

### 1. Performance and scalability

If the dataset grows, the browser has to download more rows and do more work on every page load.

That means:

- slower dashboard loads
- more memory used in the browser
- more JavaScript work for calculations that the database can do more efficiently

Databases are designed to handle grouping, averages, min/max values, and summary queries. React is not the right place for heavy aggregation work.

### 2. Reduced data exposure

The dashboard and insight pages only need summary values.

They do not need every row of:

- `stress_level`
- `anxiety_level`
- `sleep_hours`
- `daily_social_media_hours`
- `platform_usage`
- `social_interaction_level`
- `depression_label`

Sending raw records to the browser when the UI only needs aggregates exposes more data than necessary. Even in a demo app, that is a weak pattern. If the dataset later becomes sensitive, this becomes a privacy and access-boundary problem.

### 3. Cleaner architecture

The same aggregation logic was effectively duplicated in multiple places.

That creates maintenance risk:

- formulas can drift between pages
- future changes become harder
- it is easier to introduce inconsistent chart values

Moving aggregation to Supabase and centralizing the client-side fetch path makes the data flow simpler and more reliable.

## What was implemented

This fix moved the dashboard and insight pages away from raw-row fetching and onto server-side aggregate RPC calls.

### 1. Added Supabase SQL RPC functions

New file:

- [data/sql/dashboard-aggregate-rpcs.sql](/C:/Mycodes/MindScope/data/sql/dashboard-aggregate-rpcs.sql:1)

This file defines four SQL functions:

- `get_dashboard_kpis()`
- `get_platform_addiction_summary()`
- `get_interaction_depression_summary()`
- `get_usage_depression_summary()`

These functions now let Supabase calculate:

- KPI averages and min/max values
- average addiction level by platform
- depression rate by interaction group
- depression rate by rounded daily usage hour

### 2. Added a shared frontend aggregate loader

New file:

- [frontend/src/lib/dashboardAggregates.ts](/C:/Mycodes/MindScope/frontend/src/lib/dashboardAggregates.ts:1)

This module now:

- calls the four Supabase RPC functions
- gathers the results in parallel with `Promise.all(...)`
- converts the RPC responses into the exact shapes required by the dashboard charts and insight page

This file is the new shared data-access layer for the dashboard aggregate views.

### 3. Updated typed Supabase function definitions

Updated files:

- [frontend/src/types/database.ts](/C:/Mycodes/MindScope/frontend/src/types/database.ts:155)
- [frontend/src/types/teenMentalHealth.ts](/C:/Mycodes/MindScope/frontend/src/types/teenMentalHealth.ts:39)

These changes were necessary so the frontend knows the return shape of each RPC function at compile time.

Without this typing:

- function names could drift silently
- return fields could be misspelled
- numeric result handling would be less safe

### 4. Replaced browser aggregation in `DashboardPage`

Updated file:

- [frontend/src/pages/DashboardPage.tsx](/C:/Mycodes/MindScope/frontend/src/pages/DashboardPage.tsx:1)

What changed:

- removed the direct `.from('teen_mental_health_cleaned').select(...)` raw-row fetch
- removed the local `reduce(...)` aggregation logic
- replaced it with a call to `fetchDashboardAggregateData()`

After the change, `DashboardPage` now receives:

- prepared KPI card values
- prepared platform chart data
- prepared interaction chart data
- prepared usage-hour chart data

So the page is now focused on rendering, not calculating.

### 5. Replaced browser aggregation in `InsightPage`

Updated file:

- [frontend/src/pages/InsightPage.tsx](/C:/Mycodes/MindScope/frontend/src/pages/InsightPage.tsx:1)

What changed:

- removed the direct raw-row query to `teen_mental_health_cleaned`
- removed the duplicated browser-side grouping logic
- replaced it with the same shared aggregate loader used by the dashboard

This keeps the dashboard and insight pages aligned to the same source of truth.

## What problem this fixes

After this change, the frontend no longer needs to download the full dashboard dataset just to compute summaries.

Instead:

1. Supabase calculates the summaries.
2. The frontend requests only those summaries.
3. React renders the results.

This fixes the main issue in audit task 3 for these pages:

- less raw data sent to the browser
- less repeated aggregation logic in React
- better performance as data grows
- better separation between row-level data and public dashboard summaries

## Important implementation note

The frontend code is now ready for server-side aggregate fetching, but the SQL functions must exist in Supabase for the live app to work correctly.

That means this file must be applied in Supabase SQL Editor:

- [data/sql/dashboard-aggregate-rpcs.sql](/C:/Mycodes/MindScope/data/sql/dashboard-aggregate-rpcs.sql:1)

If those RPC functions are not created in the database, the dashboard and insight pages will not receive the new aggregate responses.

## Verification

The implementation was verified locally with:

```powershell
npm run lint
npm run build
```

Result:

- `npm run lint` passed
- `npm run build` passed

The existing large bundle warning from Vite still remains, but that belongs to a separate audit task about bundle size reduction, not task 3.

## Final summary

This fix was necessary because the frontend was doing database-style work with raw row data that it did not need to own.

The correct approach is:

- let Supabase calculate aggregate summaries
- let the frontend request only those summaries
- keep page components focused on rendering

That is what this implementation now does for `DashboardPage` and `InsightPage`.
