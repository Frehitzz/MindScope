-- FOR STAT/KPI CARDS get average and min/max values
create or replace function public.get_dashboard_kpis()
returns table (
  total_rows bigint,
  avg_stress_level numeric,
  max_stress_level numeric,
  avg_anxiety_level numeric,
  max_anxiety_level numeric,
  avg_sleep_hours numeric,
  min_sleep_hours numeric,
  max_sleep_hours numeric,
  avg_daily_social_media_hours numeric,
  max_daily_social_media_hours numeric
)
language sql
stable
as $$
  select
    count(*) as total_rows,
    round((sum(coalesce(stress_level, 0)) / count(*))::numeric, 1) as avg_stress_level,
    max(coalesce(stress_level, 0)) as max_stress_level,
    round((sum(coalesce(anxiety_level, 0)) / count(*))::numeric, 1) as avg_anxiety_level,
    max(coalesce(anxiety_level, 0)) as max_anxiety_level,
    round((sum(coalesce(sleep_hours, 0)) / count(*))::numeric, 1) as avg_sleep_hours,
    min(coalesce(sleep_hours, 0)) as min_sleep_hours,
    max(coalesce(sleep_hours, 0)) as max_sleep_hours,
    round((sum(coalesce(daily_social_media_hours, 0)) / count(*))::numeric, 1) as avg_daily_social_media_hours,
    max(coalesce(daily_social_media_hours, 0)) as max_daily_social_media_hours
  from public.teen_mental_health_cleaned;
$$;

-- FOR AVERAGE ADDICTION LEVEL BY PLATFORM
create or replace function public.get_platform_addiction_summary()
returns table (
  platform text,
  avg_addiction_level numeric,
  max_addiction_level numeric,
  min_addiction_level numeric
)
language sql
stable
as $$
  select
    initcap(trim(coalesce(platform_usage, 'Unknown'))) as platform,
    round(avg(coalesce(addiction_level, 0))::numeric, 1) as avg_addiction_level,
    max(coalesce(addiction_level, 0)) as max_addiction_level,
    min(coalesce(addiction_level, 0)) as min_addiction_level
  from public.teen_mental_health_cleaned
  group by initcap(trim(coalesce(platform_usage, 'Unknown')))
  order by avg_addiction_level desc, platform asc;
$$;

-- FOR DEPRESSION RATE BY INTERACTION GROUP
create or replace function public.get_interaction_depression_summary()
returns table (
  interaction_group text,
  depression_rate_pct numeric
)
language sql
stable
as $$
  select
    initcap(trim(coalesce(social_interaction_level, 'Unknown'))) as interaction_group,
    round(((sum(coalesce(depression_label, 0))::numeric / count(*)) * 100), 1) as depression_rate_pct
  from public.teen_mental_health_cleaned
  group by initcap(trim(coalesce(social_interaction_level, 'Unknown')))
  order by depression_rate_pct desc, interaction_group asc;
$$;

-- DEPRESSION RATE BY ROUNDED DAILY USAGE HOUR
create or replace function public.get_usage_depression_summary()
returns table (
  rounded_usage_hours integer,
  depression_rate_pct numeric
)
language sql
stable
as $$
  select
    round(coalesce(daily_social_media_hours, 0))::integer as rounded_usage_hours,
    round(((sum(coalesce(depression_label, 0))::numeric / count(*)) * 100), 1) as depression_rate_pct
  from public.teen_mental_health_cleaned
  group by round(coalesce(daily_social_media_hours, 0))::integer
  order by rounded_usage_hours asc;
$$;
