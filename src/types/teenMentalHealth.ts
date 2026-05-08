import type { Database } from './database';

export type TeenMentalHealthRow =
  Database['public']['Tables']['teen_mental_health']['Row'];

export type TeenMentalHealthCleanedRow =
  Database['public']['Tables']['teen_mental_health_cleaned']['Row'];

export type DashboardMetricRow = Pick<
  TeenMentalHealthCleanedRow,
  | 'stress_level'
  | 'anxiety_level'
  | 'sleep_hours'
  | 'daily_social_media_hours'
  | 'platform_usage'
  | 'addiction_level'
  | 'social_interaction_level'
  | 'depression_label'
>;

export type InsightMetricRow = Pick<
  TeenMentalHealthCleanedRow,
  | 'platform_usage'
  | 'addiction_level'
  | 'social_interaction_level'
  | 'depression_label'
  | 'daily_social_media_hours'
>;

export type DataTableRow = Pick<
  Database['public']['Views']['public_teen_mental_health_table']['Row'],
  | 'id'
  | 'gender'
  | 'social_interaction_level'
  | 'daily_social_media_hours'
  | 'platform_usage'
  | 'depression_label'
>;

export type DashboardKpiRow =
  Database['public']['Functions']['get_dashboard_kpis']['Returns'][number];

export type PlatformAddictionSummaryRow =
  Database['public']['Functions']['get_platform_addiction_summary']['Returns'][number];

export type InteractionDepressionSummaryRow =
  Database['public']['Functions']['get_interaction_depression_summary']['Returns'][number];

export type UsageDepressionSummaryRow =
  Database['public']['Functions']['get_usage_depression_summary']['Returns'][number];
