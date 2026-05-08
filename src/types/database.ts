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
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};

