# How Dashboard KPI Data Works

This file explains how the KPI cards on `DashboardPage.tsx` get their data and how React calculates the numbers.

## Short version

The 4 KPI cards on the dashboard do this:

1. React first shows default values from `src/data/mockData.ts`.
2. When the page loads, `useEffect` runs.
3. `useEffect` calls Supabase and reads rows from the `teen_mental_health_cleaned` table.
4. React loops through all returned rows and adds up each numeric column.
5. React divides each total by the number of rows to get an average.
6. React saves those averages into state with `setStats(...)`.
7. Because state changed, React re-renders the KPI cards with the live Supabase values.

## The files involved

### 1. Supabase client

File: [src/lib/supabase.ts](/abs/path/C:/Mycodes/MindScope/src/lib/supabase.ts:1)

This file creates the Supabase client:

```ts
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
```

What this means:

- `VITE_SUPABASE_URL` is your Supabase project URL.
- `VITE_SUPABASE_ANON_KEY` is your public anonymous key.
- `createClient(...)` gives your React app an object called `supabase`.
- That object is used later to query your database.

Important: this does not fetch data by itself. It only prepares the connection.

### 2. Initial dashboard values

File: [src/data/mockData.ts](/abs/path/C:/Mycodes/MindScope/src/data/mockData.ts:3)

`statsOverview` contains the initial card values:

```ts
export const statsOverview = [
  { label: 'Avg Stress Level', value: '6.8/10', ... },
  { label: 'Avg Anxiety Level', value: '7.1/10', ... },
  { label: 'Avg Sleep Hours', value: '6.2h', ... },
  { label: 'Avg Social Media Usage', value: '4.5h', ... },
];
```

In `DashboardPage.tsx`, this line uses those mock values first:

```ts
const [stats, setStats] = useState(statsOverview);
```

That means:

- `stats` is the current card data.
- Before Supabase finishes loading, the page already has something to display.

### 3. React fetches live data after the page loads

File: [src/pages/DashboardPage.tsx](/abs/path/C:/Mycodes/MindScope/src/pages/DashboardPage.tsx:43)

This is the important part:

```ts
useEffect(() => {
  async function fetchStats() {
    const { data, error } = await supabase
      .from('teen_mental_health_cleaned')
      .select('stress_level, anxiety_level, sleep_hours, daily_social_media_hours');

    ...
  }

  fetchStats();
}, []);
```

What this means:

- `useEffect(..., [])` runs once when the component mounts.
- `supabase.from('teen_mental_health_cleaned')` means "query this table".
- `.select(...)` means "only bring back these 4 columns".

So Supabase returns rows that look conceptually like this:

```ts
[
  {
    stress_level: 7,
    anxiety_level: 6,
    sleep_hours: 5.5,
    daily_social_media_hours: 4
  },
  {
    stress_level: 8,
    anxiety_level: 7,
    sleep_hours: 6,
    daily_social_media_hours: 5
  }
]
```

## How the averages are calculated

Inside `DashboardPage.tsx`, React calculates totals with `reduce`:

```ts
const totalRows = data.length;
const sumStress = data.reduce((acc, row) => acc + (row.stress_level || 0), 0);
const sumAnxiety = data.reduce((acc, row) => acc + (row.anxiety_level || 0), 0);
const sumSleep = data.reduce((acc, row) => acc + (row.sleep_hours || 0), 0);
const sumSocial = data.reduce((acc, row) => acc + (row.daily_social_media_hours || 0), 0);
```

### What `reduce` is doing

`reduce` loops through every row and keeps a running total.

Example for stress:

```ts
const sumStress = data.reduce((acc, row) => acc + (row.stress_level || 0), 0);
```

This means:

- `acc` = the running total
- `row` = one row from Supabase
- `row.stress_level || 0` = use the stress value, but if it is missing or falsy, use `0`
- final result = total stress from all rows

If the stress values were:

```ts
[7, 8, 5]
```

Then:

- start at `0`
- `0 + 7 = 7`
- `7 + 8 = 15`
- `15 + 5 = 20`

So `sumStress` becomes `20`.

### How the average is made

After getting the totals, React divides by the number of rows:

```ts
(sumStress / totalRows).toFixed(1)
```

Example:

- total stress = `20`
- total rows = `3`
- average = `20 / 3 = 6.666...`
- `.toFixed(1)` turns it into `"6.7"`

So the KPI card shows a clean 1-decimal value.

## How the KPI cards are updated

After calculating the averages, React replaces the original mock stats:

```ts
setStats([
  { label: 'Avg Stress Level', value: (sumStress / totalRows).toFixed(1), delta: 'Live from Supabase', deltaPositive: false },
  { label: 'Avg Anxiety Level', value: (sumAnxiety / totalRows).toFixed(1), delta: 'Live from Supabase', deltaPositive: false },
  { label: 'Avg Sleep Hours', value: (sumSleep / totalRows).toFixed(1) + 'h', delta: 'Live from Supabase', deltaPositive: false },
  { label: 'Avg Social Media Usage', value: (sumSocial / totalRows).toFixed(1) + 'h', delta: 'Live from Supabase', deltaPositive: false },
]);
```

This is where the final values for the cards are created.

The labels map to these calculations:

- `Avg Stress Level` = average of `stress_level`
- `Avg Anxiety Level` = average of `anxiety_level`
- `Avg Sleep Hours` = average of `sleep_hours`
- `Avg Social Media Usage` = average of `daily_social_media_hours`

## How each stat card value is calculated

This is the exact logic behind each `value` shown on the stat cards.

### 1. Avg Stress Level

React calculates:

```ts
const sumStress = data.reduce((acc, row) => acc + (row.stress_level || 0), 0);
const avgStress = (sumStress / data.length).toFixed(1);
```

Formula:

```text
Avg Stress Level = (all stress_level values added together) / total number of rows
```

Displayed value:

```ts
value: avgStress
```

Example:

```text
stress_level values: 7, 8, 5
sum = 20
rows = 3
average = 20 / 3 = 6.666...
displayed = "6.7"
```

### 2. Avg Anxiety Level

React calculates:

```ts
const sumAnxiety = data.reduce((acc, row) => acc + (row.anxiety_level || 0), 0);
const avgAnxiety = (sumAnxiety / data.length).toFixed(1);
```

Formula:

```text
Avg Anxiety Level = (all anxiety_level values added together) / total number of rows
```

Displayed value:

```ts
value: avgAnxiety
```

### 3. Avg Sleep Hours

React calculates:

```ts
const sumSleep = data.reduce((acc, row) => acc + (row.sleep_hours || 0), 0);
const avgSleep = (sumSleep / data.length).toFixed(1) + 'h';
```

Formula:

```text
Avg Sleep Hours = (all sleep_hours values added together) / total number of rows
```

Displayed value:

```ts
value: avgSleep
```

Important:

- `.toFixed(1)` makes the number 1 decimal place
- `+ 'h'` adds the `h` suffix for hours

Example:

```text
sleep_hours values: 6, 7, 5.5
sum = 18.5
rows = 3
average = 18.5 / 3 = 6.1666...
displayed = "6.2h"
```

### 4. Avg Social Media Usage

React calculates:

```ts
const sumSocial = data.reduce((acc, row) => acc + (row.daily_social_media_hours || 0), 0);
const avgSocial = (sumSocial / data.length).toFixed(1) + 'h';
```

Formula:

```text
Avg Social Media Usage = (all daily_social_media_hours values added together) / total number of rows
```

Displayed value:

```ts
value: avgSocial
```

### Exact values passed into `setStats`

This is the final place where the stat card values are created:

```ts
setStats([
  {
    label: 'Avg Stress Level',
    value: (sumStress / totalRows).toFixed(1),
    delta: 'Live from Supabase',
    deltaPositive: false,
  },
  {
    label: 'Avg Anxiety Level',
    value: (sumAnxiety / totalRows).toFixed(1),
    delta: 'Live from Supabase',
    deltaPositive: false,
  },
  {
    label: 'Avg Sleep Hours',
    value: (sumSleep / totalRows).toFixed(1) + 'h',
    delta: 'Live from Supabase',
    deltaPositive: false,
  },
  {
    label: 'Avg Social Media Usage',
    value: (sumSocial / totalRows).toFixed(1) + 'h',
    delta: 'Live from Supabase',
    deltaPositive: false,
  },
]);
```

So the card value is not calculated inside `StatCard`.

It is calculated first in `DashboardPage.tsx`, then passed down like a prop:

```tsx
<StatCard value="6.7" />
```

or:

```tsx
<StatCard value="6.2h" />
```

React then re-renders this part:

```tsx
{stats.map((stat, i) => (
  <StatCard
    key={stat.label}
    {...stat}
    icon={statIcons[i]}
  />
))}
```

That means each object inside `stats` becomes one `StatCard`.

## What the `StatCard` component does

File: [src/components/StatCard.tsx](/abs/path/C:/Mycodes/MindScope/src/components/StatCard.tsx:1)

`StatCard` does not calculate anything.

It only receives props like:

- `label`
- `value`
- `delta`
- `deltaPositive`
- `icon`

Then it displays them in the UI.

So the math happens in `DashboardPage.tsx`, not in `StatCard.tsx`.

## Important Supabase idea

Right now, the average is calculated in React, not inside Supabase.

That means:

- Supabase sends all selected rows to the frontend
- React does the summing and averaging

This works, but for large datasets it is often better to let Supabase calculate the averages in SQL, because:

- less data is sent over the network
- the database is built for aggregation
- the frontend code becomes simpler

## One thing to notice in your current code

The KPI cards are live from Supabase, but most of the charts are still using mock data:

- `moodTrendData`
- `stressTriggers`
- `wellbeingBreakdown`

Those come from `src/data/mockData.ts`, not from Supabase.

So on this page:

- KPI cards = live Supabase data
- charts and insight text = local mock/demo data

## Data flow summary

Here is the full flow:

```text
.env
  -> VITE_SUPABASE_URL + VITE_SUPABASE_ANON_KEY
  -> src/lib/supabase.ts creates the client
  -> DashboardPage.tsx imports the client
  -> useEffect runs on page load
  -> Supabase query fetches 4 columns from teen_mental_health_cleaned
  -> React uses reduce() to sum each column
  -> React divides each total by data.length
  -> setStats(...) saves the computed KPI values
  -> StatCard components render the updated values
```

## Beginner explanation of why React re-renders

React watches state.

When this runs:

```ts
setStats([...]);
```

React sees that `stats` changed, so it runs the component again and updates the screen.

That is why the cards can start with mock data and then switch to live Supabase data automatically.

## Small code notes

- `loading` is created in `DashboardPage.tsx`, but it is not currently used in the UI.
- `row.stress_level || 0` treats missing values as `0`. That may slightly change averages if null values should actually be ignored instead of counted as zero.
- `toFixed(1)` returns a string, which is fine because `StatCard` expects `value: string`.

## If you want a more accurate average

Right now null or missing values become `0`.

Example:

- real values: `7`, `8`, `null`
- current code total = `7 + 8 + 0 = 15`
- current row count = `3`
- displayed average = `5.0`

But if you wanted to ignore nulls, the average should be:

- `15 / 2 = 7.5`

So this is something to improve later if your table has empty values.

## Final takeaway

Your dashboard KPI cards are built with this pattern:

- Supabase fetches raw rows
- React calculates averages
- React stores the result in state
- `StatCard` only displays the final values

If you want, the next good step is to move these averages into a Supabase SQL query or RPC function so the database calculates them instead of the frontend.

## Query to verify the KPI values in Supabase

You can paste this into the Supabase SQL Editor:

```sql
select
  round(avg(stress_level)::numeric, 1) as avg_stress_level,
  round(avg(anxiety_level)::numeric, 1) as avg_anxiety_level,
  round(avg(sleep_hours)::numeric, 1) as avg_sleep_hours,
  round(avg(daily_social_media_hours)::numeric, 1) as avg_social_media_usage
from teen_mental_health_cleaned;
```

This should return one row with 4 values, for example:

```text
avg_stress_level | avg_anxiety_level | avg_sleep_hours | avg_social_media_usage
6.8              | 7.1               | 6.2             | 4.5
```

Those numbers should match the 4 KPI cards on your website:

- `avg_stress_level` -> `Avg Stress Level`
- `avg_anxiety_level` -> `Avg Anxiety Level`
- `avg_sleep_hours` -> `Avg Sleep Hours`
- `avg_social_media_usage` -> `Avg Social Media Usage`

For the last 2 cards, your website adds `h` after the number:

- `6.2` in Supabase becomes `6.2h` on the website
- `4.5` in Supabase becomes `4.5h` on the website

## Important difference between SQL `avg(...)` and your current React code

The SQL query above ignores `null` values automatically.

Your current React code does this:

```ts
row.sleep_hours || 0
```

That means if a value is missing, React treats it as `0`.

So if your table contains `null` values, the website and the SQL query may not match exactly.

### If you want a SQL query that matches your current React logic more closely

Use this:

```sql
select
  round((sum(coalesce(stress_level, 0)) / count(*))::numeric, 1) as avg_stress_level,
  round((sum(coalesce(anxiety_level, 0)) / count(*))::numeric, 1) as avg_anxiety_level,
  round((sum(coalesce(sleep_hours, 0)) / count(*))::numeric, 1) as avg_sleep_hours,
  round((sum(coalesce(daily_social_media_hours, 0)) / count(*))::numeric, 1) as avg_social_media_usage
from teen_mental_health_cleaned;
```

Why this matches better:

- `coalesce(column, 0)` matches `row.column || 0`
- `count(*)` matches `data.length`

So this version is the closest SQL equivalent to your current frontend calculation.

## Which query should you use?

- Use the first query if you want the normal database average.
- Use the second query if you want to compare against the website exactly as the current React code works.
