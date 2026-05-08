# Server-Side Table Fetching

Date: 2026-05-08

## What Changed

The `DataTablePage` no longer loads the full `teen_mental_health_cleaned` table into the browser and then filters it locally.

It now does these operations through Supabase queries:

- pagination
- sorting
- filtering
- filtered export

The page only requests the current slice of rows needed for display, along with the total row count for pagination.

## Why We Needed This

Audit finding 3 identified a scaling and data-exposure problem:

- the browser was downloading the full dataset
- search and filters ran entirely on the client
- pagination was only visual, not database-backed
- export reused already-downloaded browser data

That approach works for very small demo datasets, but it does not hold up once the table gets larger.

Moving these operations to Supabase reduces unnecessary transfer, keeps the page responsive, and limits how many raw rows are pushed into the browser at one time.

## What Would Happen If We Did Not Fix It

If the table stayed client-side:

- page load time would grow with every new record
- browser memory use would grow with every new record
- filtering and sorting would become slower on low-end devices
- every user would receive the whole selected dataset even if they only needed one page
- exporting would depend on having already pulled all matching rows into the browser

In short, the UI would look fine at first but degrade as the dataset grows, while also exposing more row-level data than necessary.

## What This Implementation Covers

This change fixes the `DataTablePage` path by making it query-driven.

Current behavior:

- one page of rows is fetched at a time
- row count comes from Supabase
- filters are translated into Supabase query conditions
- sort order is applied in Supabase
- export fetches the filtered result set on demand

## Remaining Scope From Audit Item 3

The dashboard and insight pages still calculate aggregates in the browser after selecting raw rows.

To fully complete audit item 3, those aggregate queries should move into database-side views or RPC functions so the frontend requests summarized results instead of full raw datasets.

This means the finding is partially fixed now:

- `DataTablePage`: fixed
- dashboard aggregate fetching: not yet moved server-side
- insight aggregate fetching: not yet moved server-side
