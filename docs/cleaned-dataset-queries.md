# Cleaned Dataset Queries

Use these queries in the Supabase SQL Editor against the cleaned table only:

- `teen_mental_health_cleaned`

Do not run these queries on the raw table `teen_mental_health` if the requirement is to analyze the cleaned dataset.
The cleaned table is the correct source because it contains the processed output after missing-value handling, normalization, and outlier filtering.

These expected answers are based on the current cleaned dataset that was generated from:

- `dataset/Teen_Mental_Health_Dataset.cleaned.csv`

## Query 1

Business question:
Which platform has the highest average addiction level?

SQL:

```sql
SELECT
  platform_usage,
  ROUND(AVG(addiction_level)::numeric, 2) AS avg_addiction_level
FROM teen_mental_health_cleaned
GROUP BY platform_usage
ORDER BY avg_addiction_level DESC;
```

Expected answer:

- `TikTok` should be first with an average addiction level of about `5.73`
- `Instagram` should be next at about `5.61`
- `Both` should be last at about `5.42`

Why that is the answer:
This query groups all cleaned records by `platform_usage` and averages `addiction_level` inside each group. `TikTok` is the answer because its group has the highest mean score after comparing all three platform categories.

Business insight:
This suggests teens in the `TikTok` group show the strongest addictive-use pattern in this dataset relative to the other platform categories. If a school, parent program, or awareness campaign had to prioritize one platform segment for digital wellness messaging, `TikTok` would be the first place to focus.

## Query 2

Business question:
Which social interaction group has the highest depression rate?

SQL:

```sql
SELECT
  social_interaction_level,
  ROUND(AVG(depression_label)::numeric, 4) AS depression_rate,
  SUM(depression_label) AS depression_cases,
  COUNT(*) AS total_records
FROM teen_mental_health_cleaned
GROUP BY social_interaction_level
ORDER BY depression_rate DESC;
```

Expected answer:

- `high` should be first with a depression rate of about `0.0297` or `2.97%`
- `medium` should be next with about `0.0228` or `2.28%`
- `low` should be last with about `0.0202` or `2.02%`

Why that is the answer:
`depression_label` is a binary field, so its average is the share of rows marked `1`. The `high` social interaction group has the largest proportion of `1` values, so it produces the highest depression rate in this dataset.

Business insight:
This result shows that higher social interaction in this dataset does not automatically correspond to lower depression risk. That means decision-makers should avoid assuming that socially active teens are low-risk and should instead combine social behavior with other indicators such as stress, anxiety, and screen use.

## Query 3

Business question:
How does depression rate change as daily social media usage increases?

SQL:

```sql
SELECT
  CASE
    WHEN daily_social_media_hours <= 2 THEN '0-2 hours'
    WHEN daily_social_media_hours <= 4 THEN '2-4 hours'
    WHEN daily_social_media_hours <= 6 THEN '4-6 hours'
    ELSE '6-8 hours'
  END AS usage_band,
  ROUND(AVG(depression_label)::numeric, 4) AS depression_rate,
  COUNT(*) AS total_records
FROM teen_mental_health_cleaned
GROUP BY usage_band
ORDER BY usage_band;
```

Expected answer:

- `0-2 hours` should be about `0.0000`
- `2-4 hours` should be about `0.0000`
- `4-6 hours` should be about `0.0292`
- `6-8 hours` should be about `0.0580`

Why that is the answer:
This query bins teens into usage ranges, then computes the average `depression_label` inside each range. In the current cleaned dataset, the rate rises as usage increases, and the `6-8 hours` group has the highest share of depression cases.

Business insight:
This reveals a clear risk gradient: the more daily social media time in the cleaned dataset, the higher the observed depression rate. From a business or intervention perspective, heavy-use bands such as `6-8 hours` are strong candidates for targeted monitoring, education, or support efforts.

## Query 4

Business question:
Which 5 records show the highest combined risk profile?

SQL:

```sql
SELECT
  age,
  gender,
  platform_usage,
  daily_social_media_hours,
  sleep_hours,
  stress_level,
  anxiety_level,
  addiction_level,
  depression_label
FROM teen_mental_health_cleaned
ORDER BY addiction_level DESC, stress_level DESC, anxiety_level DESC
LIMIT 5;
```

Expected answer:
You should get 5 rows where:

- all have `addiction_level = 10`
- all have `stress_level = 10`
- the top row should also have `anxiety_level = 10`

One expected top row is:

- `age = 19`
- `gender = female`
- `platform_usage = TikTok`
- `daily_social_media_hours = 1.2`
- `sleep_hours = 4.8`
- `stress_level = 10`
- `anxiety_level = 10`
- `addiction_level = 10`
- `depression_label = 0`

Why that is the answer:
This query sorts the table by the three strongest risk indicators in descending order and returns the first 5 records. Those rows rank highest because they have the maximum or near-maximum values across addiction, stress, and anxiety.

Business insight:
This query helps surface the most extreme risk profiles for case-review, segmentation, or escalation workflows. Instead of looking only at averages, it identifies the specific records that sit at the highest end of multiple risk indicators at the same time, which is useful when prioritizing limited support resources.

## Notes

- Small decimal differences can happen if your table data changed after the last pipeline run.
- If you reran the upload multiple times without clearing the table, counts may be higher because duplicate rows may exist.
- If that happens, truncate or recreate `teen_mental_health_cleaned`, rerun the cleaning pipeline, and then run these queries again.
