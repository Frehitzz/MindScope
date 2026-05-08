import { supabase } from './supabase';

import type {
  DashboardKpiRow,
  InteractionDepressionSummaryRow,
  PlatformAddictionSummaryRow,
  UsageDepressionSummaryRow,
} from '../types/teenMentalHealth';

export type DashboardStat = {
  label: string;
  value: string;
  delta: string;
  deltaPositive: boolean;
};

export type PlatformData = {
  labels: string[];
  addiction: number[];
  max: number[];
  min: number[];
};

export type InteractionData = {
  labels: string[];
  values: number[];
};

export type ScatterPoint = {
  x: number;
  y: number;
};

export type DashboardAggregateData = {
  stats: DashboardStat[];
  platformData: PlatformData;
  interactionData: InteractionData;
  scatterData: ScatterPoint[];
};

function buildStats(kpi: DashboardKpiRow): DashboardStat[] {
  return [
    {
      label: 'Avg Stress Level',
      value: kpi.avg_stress_level.toFixed(1),
      delta: `Max recorded: ${kpi.max_stress_level}`,
      deltaPositive: true,
    },
    {
      label: 'Avg Anxiety Level',
      value: kpi.avg_anxiety_level.toFixed(1),
      delta: `Max recorded: ${kpi.max_anxiety_level}`,
      deltaPositive: true,
    },
    {
      label: 'Avg Sleep Hours',
      value: `${kpi.avg_sleep_hours.toFixed(1)}h`,
      delta: `Range: ${kpi.min_sleep_hours.toFixed(1)}h - ${kpi.max_sleep_hours.toFixed(1)}h`,
      deltaPositive: true,
    },
    {
      label: 'Daily Social Media',
      value: `${kpi.avg_daily_social_media_hours.toFixed(1)}h`,
      delta: `Max: ${kpi.max_daily_social_media_hours.toFixed(1)}h/day`,
      deltaPositive: true,
    },
  ];
}

function buildPlatformData(rows: PlatformAddictionSummaryRow[]): PlatformData {
  return {
    labels: rows.map((row) => row.platform),
    addiction: rows.map((row) => row.avg_addiction_level),
    max: rows.map((row) => row.max_addiction_level),
    min: rows.map((row) => row.min_addiction_level),
  };
}

function buildInteractionData(rows: InteractionDepressionSummaryRow[]): InteractionData {
  return {
    labels: rows.map((row) => row.interaction_group),
    values: rows.map((row) => row.depression_rate_pct),
  };
}

function buildScatterData(rows: UsageDepressionSummaryRow[]): ScatterPoint[] {
  return rows.map((row) => ({
    x: row.rounded_usage_hours,
    y: row.depression_rate_pct,
  }));
}

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
    stats: kpi ? buildStats(kpi) : [],
    platformData: buildPlatformData(platformRows ?? []),
    interactionData: buildInteractionData(interactionRows ?? []),
    scatterData: buildScatterData(usageRows ?? []),
  };
}
