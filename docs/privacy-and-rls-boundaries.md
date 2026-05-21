# Privacy and RLS Boundaries

Date: 2026-05-08

## Purpose

This document defines the intended privacy boundary for the MindScope Supabase setup and explains which data should be exposed to the browser.

This project currently uses a demo educational dataset, but the same frontend patterns should not be treated as safe for real student, health, or wellbeing data unless Row Level Security and role boundaries are configured correctly.

## Current frontend data access

The browser connects to Supabase with:

- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`

That means all frontend reads happen as the Supabase `anon` role.

Current frontend access paths:

- `DashboardPage` and `InsightPage` read aggregate data through RPC functions.
- `DataTablePage` reads filtered row-level records from `teen_mental_health_cleaned`.

Relevant files:

- [frontend/src/api/supabase.ts](/C:/Mycodes/MindScope/frontend/src/api/supabase.ts:1)
- [frontend/src/lib/dashboardAggregates.ts](/C:/Mycodes/MindScope/frontend/src/lib/dashboardAggregates.ts:1)
- [frontend/src/pages/DataTablePage.tsx](/C:/Mycodes/MindScope/frontend/src/pages/DataTablePage.tsx:1)

## Privacy boundary

The intended boundary is:

1. The browser should only receive the minimum data needed for the current screen.
2. Public dashboard/insight views should prefer aggregate data over raw rows.
3. Row-level records should only be exposed if the project explicitly accepts that access level for the target audience.
4. Service-role credentials must never be shipped to the browser.

For this repository, that means:

- `anon` can be allowed to call safe aggregate RPC functions used by the dashboard.
- `anon` should not be given unrestricted row-level access if the dataset is real or sensitive.
- bulk upload and admin operations should use a server-side or script-only secret, never a Vite client variable.

## Recommended role model

### `anon` role

Intended use:

- public frontend access
- read-only access to approved aggregate summaries
- no direct write access

Recommended permissions:

- allow execute on dashboard aggregate RPCs
- deny direct access to raw sensitive tables unless the dataset is intentionally public and low-risk

### `authenticated` role

Intended use:

- signed-in users, if the app grows beyond the demo phase

Recommended permissions:

- only grant row-level access if there is a clear user model and matching RLS policy
- scope access by ownership, tenant, cohort, or other explicit rule

### `service_role`

Intended use:

- dataset upload scripts
- backend/admin automation

Rules:

- keep it outside the frontend
- store it only in server or script environment variables
- never expose it through `VITE_` variables

## Table and RPC guidance

### Raw tables

Treat these as protected by default:

- `teen_mental_health`
- `teen_mental_health_cleaned`

If this remains only a classroom demo with non-sensitive public sample data, limited `select` access may be acceptable. If the project is ever connected to real student data, direct browser reads from these tables should be removed or tightly restricted.

### Aggregate RPC functions

These are safer to expose than raw-row reads because they return summaries instead of individual records:

- `get_dashboard_kpis()`
- `get_platform_addiction_summary()`
- `get_interaction_depression_summary()`
- `get_usage_depression_summary()`

Source:

- [data/sql/dashboard-aggregate-rpcs.sql](/C:/Mycodes/MindScope/data/sql/dashboard-aggregate-rpcs.sql:1)

If RLS is enabled and these RPCs are meant to power a public dashboard, define them as `SECURITY DEFINER` functions and grant execute access explicitly. Otherwise the functions may run with the caller's row visibility and return zero rows to the frontend even though the table contains data.

If the project evolves further, the preferred direction is:

- dashboard and insight pages use only aggregate RPCs/views
- row-level pages require stricter access rules than aggregate pages

## Minimum RLS recommendations

Enable RLS on the raw tables:

```sql
alter table public.teen_mental_health enable row level security;
alter table public.teen_mental_health_cleaned enable row level security;
```

For a demo/public aggregate setup, prefer:

1. no public raw-table policy for `anon`
2. explicit execute permission for approved aggregate RPCs
3. restricted raw-table policies only if row-level browsing is intentionally allowed

Example starting point for aggregate RPC exposure:

```sql
revoke all on table public.teen_mental_health from anon;
revoke all on table public.teen_mental_health_cleaned from anon;

grant execute on function public.get_dashboard_kpis() to anon;
grant execute on function public.get_platform_addiction_summary() to anon;
grant execute on function public.get_interaction_depression_summary() to anon;
grant execute on function public.get_usage_depression_summary() to anon;
```

If you intentionally keep `DataTablePage` public for demo purposes, document that decision explicitly and accept that users can browse the filtered row set exposed by the frontend queries.

## Current repo risk

The main remaining privacy risk is `DataTablePage`.

It still queries row-level records from `teen_mental_health_cleaned` using the browser anon key. That may be acceptable for a demo dataset, but it is not an appropriate default for real student wellbeing data.

If the project needs stronger privacy, the next step is to change the row-level data table boundary by doing one of these:

1. remove public row-level browsing entirely
2. move row-level access behind authenticated RLS policies
3. expose only a reduced, approved subset of columns through a dedicated safe view

## Environment variable boundary

Frontend `.env` files should contain only public browser-safe variables:

```env
VITE_SUPABASE_URL=your-project-url
VITE_SUPABASE_ANON_KEY=your-public-anon-key
```

Do not place service-role secrets in frontend env files.

Script-side upload/admin variables should stay separate, for example:

```env
SUPABASE_URL=your-project-url
SUPABASE_KEY=your-service-role-key
```

Those values are appropriate for Python scripts such as data upload, not for Vite client code.

## Practical policy for this repository

Use this standard unless the project requirements change:

- dashboard and insight pages: safe for `anon` through aggregate RPCs
- data upload scripts: service role only
- data table: demo-only unless stronger RLS rules are added
- real or sensitive data: do not expose raw rows to public frontend clients

## Summary

Task 4 is complete when the repository clearly states:

- what the browser is allowed to read
- what must stay behind service-role access
- why aggregate RPCs are safer than raw-table reads
- why the current row-level table page is a demo boundary, not a production-safe default

This document establishes that boundary for the current codebase.
