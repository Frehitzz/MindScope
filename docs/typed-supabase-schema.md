# Typed Supabase Schema Support

Date: 2026-05-08

## What Was Added

The frontend now uses a typed Supabase client and shared row-type aliases:

- `frontend/src/types/database.ts`
- `frontend/src/types/teenMentalHealth.ts`
- `frontend/src/api/supabase.ts`

The pages that read from `teen_mental_health_cleaned` now import shared types instead of defining their own local row shapes or relying on untyped query results.

## Why We Need This

Before this change, the app was reading from Supabase with an untyped client. That meant TypeScript could not verify:

- whether a selected column name actually exists
- whether a column is nullable
- whether a field is numeric or text
- whether multiple pages were using the same table shape consistently

This project calculates KPIs, chart data, and table rows from the same Supabase table. That kind of code is sensitive to schema drift. If the database changes and the app stays untyped, the compiler will not warn early enough.

Typed schema support moves these checks into compile time instead of leaving them to runtime.

## What Could Happen If We Do Not Fix It

If this stayed untyped, the likely failure modes are straightforward:

- A column rename in Supabase can leave the app compiling while returning `null` or broken data at runtime.
- A numeric field treated like a string can corrupt averages, chart points, sorting, or filters.
- A nullable field assumed to always exist can produce `undefined` access bugs or misleading dashboard output.
- Different pages can quietly define slightly different row shapes for the same table, causing inconsistent behavior.
- Refactors become riskier because there is no single source of truth for the table contract.

In this repository specifically, the dashboard, insight page, and data table all read from `teen_mental_health_cleaned`. Without shared types, each page can drift from the real schema independently.

## What This Fix Changes

The implementation adds two layers:

1. A typed `Database` schema that describes the `teen_mental_health` and `teen_mental_health_cleaned` tables.
2. Shared row aliases such as `DashboardMetricRow`, `InsightMetricRow`, and `DataTableRow` so each page imports the same contract from one place.

This gives the project:

- stronger compile-time checks
- less duplicated row typing
- safer query refactors
- clearer ownership of the data contract

## Practical Benefit

If a table field changes now, TypeScript is much more likely to fail in the editor or build instead of letting the mistake ship into the browser.

That is the real value of this change: earlier failure, narrower fixes, and lower risk when the Supabase schema evolves.
