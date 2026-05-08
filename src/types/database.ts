export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  public: {
    Tables: {
      teen_mental_health: {
        Row: {
          id: number;
          age: number | null;
          gender: string | null;
          daily_social_media_hours: number | null;
          platform_usage: string | null;
          sleep_hours: number | null;
          screen_time_before_sleep: number | null;
          academic_performance: number | null;
          physical_activity: number | null;
          social_interaction_level: string | null;
          stress_level: number | null;
          anxiety_level: number | null;
          addiction_level: number | null;
          depression_label: number | null;
        };
        Insert: {
          id?: number;
          age?: number | null;
          gender?: string | null;
          daily_social_media_hours?: number | null;
          platform_usage?: string | null;
          sleep_hours?: number | null;
          screen_time_before_sleep?: number | null;
          academic_performance?: number | null;
          physical_activity?: number | null;
          social_interaction_level?: string | null;
          stress_level?: number | null;
          anxiety_level?: number | null;
          addiction_level?: number | null;
          depression_label?: number | null;
        };
        Update: {
          id?: number;
          age?: number | null;
          gender?: string | null;
          daily_social_media_hours?: number | null;
          platform_usage?: string | null;
          sleep_hours?: number | null;
          screen_time_before_sleep?: number | null;
          academic_performance?: number | null;
          physical_activity?: number | null;
          social_interaction_level?: string | null;
          stress_level?: number | null;
          anxiety_level?: number | null;
          addiction_level?: number | null;
          depression_label?: number | null;
        };
        Relationships: [];
      };
      teen_mental_health_cleaned: {
        Row: {
          id: number;
          age: number | null;
          gender: string | null;
          daily_social_media_hours: number | null;
          platform_usage: string | null;
          sleep_hours: number | null;
          screen_time_before_sleep: number | null;
          academic_performance: number | null;
          physical_activity: number | null;
          social_interaction_level: string | null;
          stress_level: number | null;
          anxiety_level: number | null;
          addiction_level: number | null;
          depression_label: number | null;
          age_was_missing: number | null;
          gender_was_missing: number | null;
          daily_social_media_hours_was_missing: number | null;
          platform_usage_was_missing: number | null;
          sleep_hours_was_missing: number | null;
          screen_time_before_sleep_was_missing: number | null;
          academic_performance_was_missing: number | null;
          physical_activity_was_missing: number | null;
          social_interaction_level_was_missing: number | null;
          stress_level_was_missing: number | null;
          anxiety_level_was_missing: number | null;
          addiction_level_was_missing: number | null;
          depression_label_was_missing: number | null;
          daily_social_media_hours_min_max: number | null;
        };
        Insert: {
          id?: number;
          age?: number | null;
          gender?: string | null;
          daily_social_media_hours?: number | null;
          platform_usage?: string | null;
          sleep_hours?: number | null;
          screen_time_before_sleep?: number | null;
          academic_performance?: number | null;
          physical_activity?: number | null;
          social_interaction_level?: string | null;
          stress_level?: number | null;
          anxiety_level?: number | null;
          addiction_level?: number | null;
          depression_label?: number | null;
          age_was_missing?: number | null;
          gender_was_missing?: number | null;
          daily_social_media_hours_was_missing?: number | null;
          platform_usage_was_missing?: number | null;
          sleep_hours_was_missing?: number | null;
          screen_time_before_sleep_was_missing?: number | null;
          academic_performance_was_missing?: number | null;
          physical_activity_was_missing?: number | null;
          social_interaction_level_was_missing?: number | null;
          stress_level_was_missing?: number | null;
          anxiety_level_was_missing?: number | null;
          addiction_level_was_missing?: number | null;
          depression_label_was_missing?: number | null;
          daily_social_media_hours_min_max?: number | null;
        };
        Update: {
          id?: number;
          age?: number | null;
          gender?: string | null;
          daily_social_media_hours?: number | null;
          platform_usage?: string | null;
          sleep_hours?: number | null;
          screen_time_before_sleep?: number | null;
          academic_performance?: number | null;
          physical_activity?: number | null;
          social_interaction_level?: string | null;
          stress_level?: number | null;
          anxiety_level?: number | null;
          addiction_level?: number | null;
          depression_label?: number | null;
          age_was_missing?: number | null;
          gender_was_missing?: number | null;
          daily_social_media_hours_was_missing?: number | null;
          platform_usage_was_missing?: number | null;
          sleep_hours_was_missing?: number | null;
          screen_time_before_sleep_was_missing?: number | null;
          academic_performance_was_missing?: number | null;
          physical_activity_was_missing?: number | null;
          social_interaction_level_was_missing?: number | null;
          stress_level_was_missing?: number | null;
          anxiety_level_was_missing?: number | null;
          addiction_level_was_missing?: number | null;
          depression_label_was_missing?: number | null;
          daily_social_media_hours_min_max?: number | null;
        };
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: {
      get_dashboard_kpis: {
        Args: Record<PropertyKey, never>;
        Returns: {
          total_rows: number;
          avg_stress_level: number;
          max_stress_level: number;
          avg_anxiety_level: number;
          max_anxiety_level: number;
          avg_sleep_hours: number;
          min_sleep_hours: number;
          max_sleep_hours: number;
          avg_daily_social_media_hours: number;
          max_daily_social_media_hours: number;
        }[];
      };
      get_platform_addiction_summary: {
        Args: Record<PropertyKey, never>;
        Returns: {
          platform: string;
          avg_addiction_level: number;
          max_addiction_level: number;
          min_addiction_level: number;
        }[];
      };
      get_interaction_depression_summary: {
        Args: Record<PropertyKey, never>;
        Returns: {
          interaction_group: string;
          depression_rate_pct: number;
        }[];
      };
      get_usage_depression_summary: {
        Args: Record<PropertyKey, never>;
        Returns: {
          rounded_usage_hours: number;
          depression_rate_pct: number;
        }[];
      };
    };
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};
