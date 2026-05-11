# Dashboard Chart Analysis

This document explains how these three dashboard charts are calculated in the frontend, what the displayed values mean, how to verify them in Supabase, and whether they answer your business questions.

Code source:

- [frontend/src/pages/DashboardPage.tsx](/C:/Mycodes/MindScope/frontend/src/pages/DashboardPage.tsx:75)
- [frontend/src/pages/DashboardPage.tsx](/C:/Mycodes/MindScope/frontend/src/pages/DashboardPage.tsx:96)
- [frontend/src/pages/DashboardPage.tsx](/C:/Mycodes/MindScope/frontend/src/pages/DashboardPage.tsx:114)

Validation reference already present in the repo:

- [docs/cleaned-dataset-queries.md](/C:/Mycodes/MindScope/docs/cleaned-dataset-queries.md:17)

Data source:

- `teen_mental_health_cleaned`

The current local cleaned dataset file has `1000` rows and matches the expected answers already documented in [docs/cleaned-dataset-queries.md](/C:/Mycodes/MindScope/docs/cleaned-dataset-queries.md:17).

## Executive Answer

Q1. Which platform has the highest average addiction level?

- Yes, the chart answers it.
- Current answer: `TikTok` at about `5.73` raw average, shown in the chart as `5.7` because the frontend rounds to 1 decimal place.

Q2. Which social interaction group has the highest depression rate?

- Yes, the chart answers the ranking.
- Current answer: `High` social interaction at about `2.97%`, shown in the chart as `3.0%`.
- The chart now uses a `lollipop` chart, which is a better fit for comparing category-level rates.

Q3. How does depression rate change as daily social media usage increases?

- Yes, the chart gives a direct view of that relationship.
- Current frontend-equivalent answer by rounded hour:
  - `1h`: `0.0%`
  - `2h`: `0.0%`
  - `3h`: `0.0%`
  - `4h`: `0.0%`
  - `5h`: `5.2%`
  - `6h`: `2.9%`
  - `7h`: `3.8%`
  - `8h`: `10.1%`
- Business interpretation: depression rate is `0%` through `4h`, then rises sharply after that, with some fluctuation, and peaks at `8h`.
- Important caveat: this is not perfectly monotonic hour by hour. It is directionally higher at heavier usage, but it dips between some adjacent hours.

## 1. Avg. Addiction Level by Platform

Frontend logic:

- Groups rows by `platform_usage`
- Calculates:
  - average addiction level
  - highest addiction level
  - lowest addiction level
- The visible chart includes three bar series:
  - `Avg Addiction Level`
  - `Highest`
  - `Lowest`

Relevant code:

- [frontend/src/pages/DashboardPage.tsx](/C:/Mycodes/MindScope/frontend/src/pages/DashboardPage.tsx:75)
- [frontend/src/pages/DashboardPage.tsx](/C:/Mycodes/MindScope/frontend/src/pages/DashboardPage.tsx:89)
- [frontend/src/pages/DashboardPage.tsx](/C:/Mycodes/MindScope/frontend/src/pages/DashboardPage.tsx:184)

What the displayed values mean:

- The `Avg Addiction Level` bars are means.
- The frontend rounds the average to `1` decimal place with `toFixed(1)`.
- The chart also displays separate max and min bars, so this chart is not showing only means.

Current values from the cleaned dataset:

| Platform | Raw Average | Displayed Avg | Highest | Lowest |
| --- | ---: | ---: | ---: | ---: |
| TikTok | 5.7297 | 5.7 | 10 | 1 |
| Instagram | 5.6051 | 5.6 | 10 | 1 |
| Both | 5.4190 | 5.4 | 10 | 1 |

Does it answer Q1?

- Yes.
- `TikTok` has the highest average addiction level.

Copy-paste SQL to match the chart:

```sql
SELECT
  INITCAP(TRIM(platform_usage)) AS platform,
  ROUND(AVG(addiction_level)::numeric, 1) AS displayed_avg_addiction_level,
  ROUND(AVG(addiction_level)::numeric, 4) AS raw_avg_addiction_level,
  MAX(addiction_level) AS highest_addiction_level,
  MIN(addiction_level) AS lowest_addiction_level,
  COUNT(*) AS total_records
FROM teen_mental_health_cleaned
GROUP BY INITCAP(TRIM(platform_usage))
ORDER BY raw_avg_addiction_level DESC;
```

## 2. Depression Rate by Interaction Group

Frontend logic:

- Groups rows by `social_interaction_level`
- Treats `depression_label` as binary `0/1`
- Calculates `SUM(depression_label) / COUNT(*) * 100`
- Rounds to `1` decimal place

Relevant code:

- [frontend/src/pages/DashboardPage.tsx](/C:/Mycodes/MindScope/frontend/src/pages/DashboardPage.tsx:96)
- [frontend/src/pages/DashboardPage.tsx](/C:/Mycodes/MindScope/frontend/src/pages/DashboardPage.tsx:107)
- [frontend/src/pages/DashboardPage.tsx](/C:/Mycodes/MindScope/frontend/src/pages/DashboardPage.tsx:287)

What the displayed values mean:

- Yes, these values come from a mean.
- More precisely, they are the mean of a binary field:
  - `AVG(depression_label)` = depression rate
  - then multiplied by `100` to display as a percent
- The lollipop chart visualizes those percentages as:
  - one categorical position per interaction group on the X-axis
  - one dot at the group depression rate on the Y-axis
  - one vertical stem from `0` to the dot
- Example:
  - if `9` out of `303` rows in a group have `depression_label = 1`
  - then the rate is `9 / 303 = 0.0297`
  - displayed as `3.0%`

Current values from the cleaned dataset:

| Interaction Group | Depression Cases | Total Records | Raw Rate | Displayed Rate |
| --- | ---: | ---: | ---: | ---: |
| High | 9 | 303 | 0.0297 | 3.0% |
| Medium | 8 | 351 | 0.0228 | 2.3% |
| Low | 7 | 346 | 0.0202 | 2.0% |

Does it answer Q2?

- Yes, for ranking and comparison.
- `High` has the highest depression rate.

Chart-design assessment:

- The calculation is correct.
- The current `lollipop` chart is appropriate for this metric because it compares category-level rates without implying they are shares of one whole.
- It keeps the ranking clear while remaining visually different from the bar chart used elsewhere in the dashboard.

Copy-paste SQL to match the chart:

```sql
SELECT
  INITCAP(TRIM(social_interaction_level)) AS interaction_group,
  SUM(depression_label) AS depression_cases,
  COUNT(*) AS total_records,
  ROUND(AVG(depression_label)::numeric, 4) AS raw_depression_rate,
  ROUND((AVG(depression_label) * 100)::numeric, 1) AS displayed_depression_rate_pct
FROM teen_mental_health_cleaned
GROUP BY INITCAP(TRIM(social_interaction_level))
ORDER BY raw_depression_rate DESC;
```

## 3. Usage Hours vs. Depression Rate

Frontend logic:

- Rounds `daily_social_media_hours` to the nearest whole number using `Math.round(...)`
- Groups rows by that rounded hour
- Calculates depression rate inside each rounded-hour group:
  - `SUM(depression_label) / COUNT(*) * 100`
- Rounds the displayed rate to `1` decimal place

Relevant code:

- [frontend/src/pages/DashboardPage.tsx](/C:/Mycodes/MindScope/frontend/src/pages/DashboardPage.tsx:114)
- [frontend/src/pages/DashboardPage.tsx](/C:/Mycodes/MindScope/frontend/src/pages/DashboardPage.tsx:122)
- [frontend/src/pages/DashboardPage.tsx](/C:/Mycodes/MindScope/frontend/src/pages/DashboardPage.tsx:312)

What the displayed values mean:

- Yes, these values also come from a mean.
- It is the mean of the binary `depression_label` within each rounded usage-hour bucket, multiplied by `100`.
- This chart is more precise than the banded query in [docs/cleaned-dataset-queries.md](/C:/Mycodes/MindScope/docs/cleaned-dataset-queries.md:75), because the chart uses exact rounded hours `1` to `8`, not wide ranges like `0-2` or `6-8`.

Current frontend-equivalent values:

| Rounded Hours | Depression Cases | Total Records | Raw Rate | Displayed Rate |
| --- | ---: | ---: | ---: | ---: |
| 1 | 0 | 63 | 0.0000 | 0.0% |
| 2 | 0 | 162 | 0.0000 | 0.0% |
| 3 | 0 | 117 | 0.0000 | 0.0% |
| 4 | 0 | 175 | 0.0000 | 0.0% |
| 5 | 7 | 134 | 0.0522 | 5.2% |
| 6 | 4 | 140 | 0.0286 | 2.9% |
| 7 | 5 | 130 | 0.0385 | 3.8% |
| 8 | 8 | 79 | 0.1013 | 10.1% |

Does it answer Q3?

- Yes.
- It shows that depression rate is much higher in heavier-usage groups, especially from `5h` onward, and highest at `8h`.
- More precise answer:
  - no depression cases appear in rounded-hour groups `1` through `4`
  - the rate jumps at `5h`
  - it dips at `6h`
  - rises again at `7h`
  - peaks at `8h`

Important interpretation note:

- If your business question expects a smooth increase, this chart does not show a perfectly smooth line.
- If your business question expects the overall pattern, then yes, heavier usage is associated with higher depression rates.
- The existing banded query in [docs/cleaned-dataset-queries.md](/C:/Mycodes/MindScope/docs/cleaned-dataset-queries.md:75) shows a cleaner monotonic increase because it uses broader buckets.

Copy-paste SQL to match the frontend chart exactly:

```sql
SELECT
  ROUND(daily_social_media_hours) AS rounded_usage_hours,
  SUM(depression_label) AS depression_cases,
  COUNT(*) AS total_records,
  ROUND(AVG(depression_label)::numeric, 4) AS raw_depression_rate,
  ROUND((AVG(depression_label) * 100)::numeric, 1) AS displayed_depression_rate_pct
FROM teen_mental_health_cleaned
GROUP BY ROUND(daily_social_media_hours)
ORDER BY rounded_usage_hours;
```

Copy-paste SQL to answer the broader business trend with usage bands:

```sql
SELECT
  CASE
    WHEN daily_social_media_hours <= 2 THEN '0-2 hours'
    WHEN daily_social_media_hours <= 4 THEN '2-4 hours'
    WHEN daily_social_media_hours <= 6 THEN '4-6 hours'
    ELSE '6-8 hours'
  END AS usage_band,
  SUM(depression_label) AS depression_cases,
  COUNT(*) AS total_records,
  ROUND(AVG(depression_label)::numeric, 4) AS raw_depression_rate,
  ROUND((AVG(depression_label) * 100)::numeric, 1) AS displayed_depression_rate_pct
FROM teen_mental_health_cleaned
GROUP BY usage_band
ORDER BY usage_band;
```

Expected banded result:

| Usage Band | Raw Rate | Displayed Rate |
| --- | ---: | ---: |
| 0-2 hours | 0.0000 | 0.0% |
| 2-4 hours | 0.0000 | 0.0% |
| 4-6 hours | 0.0292 | 2.9% |
| 6-8 hours | 0.0580 | 5.8% |

## Accuracy Check Checklist

Run these checks in Supabase SQL Editor:

1. Confirm row count:

```sql
SELECT COUNT(*) AS total_rows
FROM teen_mental_health_cleaned;
```

Expected:

- `1000`

2. Run the three chart-validation queries above.

3. Compare:

- platform chart should show `TikTok` highest at about `5.7`
- interaction chart should show `High` highest at about `3.0%`
- usage chart should show `8h` highest at about `10.1%`

4. If your results differ a lot:

- check whether the table contains duplicate uploads
- check whether the dashboard is reading `teen_mental_health_cleaned`
- check whether the data was reloaded after a new cleaning run

## Final Assessment

Do these charts answer the business questions?

- Q1: `Yes`
- Q2: `Yes`, and the current `lollipop` chart type is appropriate for rate comparison
- Q3: `Yes`, with an important nuance:
  - the frontend chart shows the detailed rounded-hour pattern
  - the broader banded SQL gives the cleaner strategic trend

Most defensible business summary:

- `TikTok` has the highest average addiction level.
- `High` social interaction has the highest depression rate in this dataset.
- Depression rate is materially higher in heavier daily social media usage groups, especially from `5h` onward, with the highest observed rate at `8h`.
