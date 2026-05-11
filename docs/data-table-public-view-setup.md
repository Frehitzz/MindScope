# Safer Data Table Setup With a Public View

Date: 2026-05-08

## Recommended approach

The better option for `DataTablePage` is:

- keep the raw table `teen_mental_health_cleaned` protected
- create a public view that exposes only the columns the table page needs
- allow `anon` to read that view instead of the raw table

This is safer than giving `anon` direct `SELECT` access to the full cleaned table.

## Why this is better

Right now `DataTablePage` only displays these fields:

- `id`
- `gender`
- `social_interaction_level`
- `daily_social_media_hours`
- `platform_usage`
- `depression_label`

So the browser does not need access to every column in `teen_mental_health_cleaned`.

Using a public view lets you:

- expose only approved columns
- keep extra columns off the public frontend path
- preserve a cleaner privacy boundary for the school demo

## What you need to do in Supabase

Open Supabase SQL Editor and run this:

```sql
alter table public.teen_mental_health_cleaned enable row level security;

create or replace view public.public_teen_mental_health_table as
select
  id,
  gender,
  social_interaction_level,
  daily_social_media_hours,
  platform_usage,
  depression_label
from public.teen_mental_health_cleaned;

grant select on public.public_teen_mental_health_table to anon;
grant select on public.public_teen_mental_health_table to authenticated;
```

## Important note about RLS

Postgres views normally run using the permissions of the view owner.

That means this setup is useful when:

- you want the browser to read only the reduced column set from the view
- you do not want to grant broad raw-table access in the frontend code

If your Supabase/Postgres setup still blocks the view because of RLS behavior in your project, the fallback is:

1. keep the dashboard RPCs as `SECURITY DEFINER`
2. replace the table page with an RPC-based table endpoint

For a school project, the public-view approach is usually the best balance between simplicity and privacy.

## What you need to change in the code

Update `DataTablePage.tsx` so it queries the view instead of the raw table.

Replace:

```ts
.from('teen_mental_health_cleaned')
```

With:

```ts
.from('public_teen_mental_health_table')
```

You need to do that in both places:

- the paginated fetch query
- the export query

File:

- [frontend/src/pages/DataTablePage.tsx](/C:/Mycodes/MindScope/frontend/src/pages/DataTablePage.tsx:1)

## Optional typed schema update

If you want your Supabase types to fully match the new view, add the view to:

- [frontend/src/types/database.ts](/C:/Mycodes/MindScope/frontend/src/types/database.ts:1)

For the project to work, this is not strictly required if the selected columns match the existing `DataTableRow` shape, but it is the cleaner long-term option.

## Exact implementation checklist

1. Run the SQL above in Supabase SQL Editor.
2. Change `DataTablePage.tsx` to read from `public_teen_mental_health_table`.
3. Refresh the app.
4. Confirm the table loads rows again.
5. Confirm dashboard RPCs still work separately.

## If you want the fastest temporary fix instead

If you do not want to introduce a view right now, the simpler but less safe option is to allow `anon` to read the raw table directly with a `SELECT` policy.

That works, but it is not the preferred boundary.

## Final recommendation

For this repo, the best practical approach is:

- dashboard and insight pages use aggregate RPCs
- data table reads from a reduced public view
- raw cleaned table stays treated as the protected source

That gives you a cleaner setup for a school project without overcomplicating the architecture.
