import {
  buildDashboardStats,
  groupAddictionByPlatform,
  groupDepressionByInteraction,
  groupDepressionByUsageHour,
  type DashboardStat,
  type InteractionData,
  type PlatformData,
  type ScatterPoint,
} from './analytics';
import { supabase } from './supabase';

export type DashboardAggregateData = {
  stats: DashboardStat[];
  platformData: PlatformData;
  interactionData: InteractionData;
  scatterData: ScatterPoint[];
};

export async function fetchDashboardAggregateData(): Promise<DashboardAggregateData> {
  const [
    { data: kpiData, error: kpiError },
    { data: platformRows, error: platformError },
    { data: interactionRows, error: interactionError },
    { data: usageRows, error: usageError },
  ] = await Promise.all([
    supabase.rpc('get_dashboard_kpis'),
    supabase.rpc('get_platform_addiction_summary'),
    supabase.rpc('get_interaction_depression_summary'),
    supabase.rpc('get_usage_depression_summary'),
  ]);

  if (kpiError) throw kpiError;
  if (platformError) throw platformError;
  if (interactionError) throw interactionError;
  if (usageError) throw usageError;

  const kpi = kpiData?.[0];

  return {
    stats: kpi ? buildDashboardStats(kpi) : [],
    platformData: groupAddictionByPlatform(platformRows ?? []),
    interactionData: groupDepressionByInteraction(interactionRows ?? []),
    scatterData: groupDepressionByUsageHour(usageRows ?? []),
  };
}
