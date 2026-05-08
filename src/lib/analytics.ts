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

export type InsightSummary = {
  title: string;
  summary: string;
};

function toNumber(value: number | null | undefined): number {
  return typeof value === 'number' && Number.isFinite(value) ? value : 0;
}

function toLabel(value: string | null | undefined, fallback: string): string {
  const trimmed = value?.trim();
  return trimmed ? trimmed : fallback;
}

export function buildDashboardStats(kpi: DashboardKpiRow): DashboardStat[] {
  const avgStress = toNumber(kpi.avg_stress_level);
  const maxStress = toNumber(kpi.max_stress_level);
  const avgAnxiety = toNumber(kpi.avg_anxiety_level);
  const maxAnxiety = toNumber(kpi.max_anxiety_level);
  const avgSleep = toNumber(kpi.avg_sleep_hours);
  const minSleep = toNumber(kpi.min_sleep_hours);
  const maxSleep = toNumber(kpi.max_sleep_hours);
  const avgSocial = toNumber(kpi.avg_daily_social_media_hours);
  const maxSocial = toNumber(kpi.max_daily_social_media_hours);

  return [
    {
      label: 'Avg Stress Level',
      value: avgStress.toFixed(1),
      delta: `Max recorded: ${maxStress}`,
      deltaPositive: true,
    },
    {
      label: 'Avg Anxiety Level',
      value: avgAnxiety.toFixed(1),
      delta: `Max recorded: ${maxAnxiety}`,
      deltaPositive: true,
    },
    {
      label: 'Avg Sleep Hours',
      value: `${avgSleep.toFixed(1)}h`,
      delta: `Range: ${minSleep.toFixed(1)}h - ${maxSleep.toFixed(1)}h`,
      deltaPositive: true,
    },
    {
      label: 'Daily Social Media',
      value: `${avgSocial.toFixed(1)}h`,
      delta: `Max: ${maxSocial.toFixed(1)}h/day`,
      deltaPositive: true,
    },
  ];
}

export function groupAddictionByPlatform(rows: PlatformAddictionSummaryRow[]): PlatformData {
  return {
    labels: rows.map((row) => toLabel(row.platform, 'Unknown')),
    addiction: rows.map((row) => toNumber(row.avg_addiction_level)),
    max: rows.map((row) => toNumber(row.max_addiction_level)),
    min: rows.map((row) => toNumber(row.min_addiction_level)),
  };
}

export function groupDepressionByInteraction(rows: InteractionDepressionSummaryRow[]): InteractionData {
  return {
    labels: rows.map((row) => toLabel(row.interaction_group, 'Unknown')),
    values: rows.map((row) => toNumber(row.depression_rate_pct)),
  };
}

export function groupDepressionByUsageHour(rows: UsageDepressionSummaryRow[]): ScatterPoint[] {
  return rows.map((row) => ({
    x: toNumber(row.rounded_usage_hours),
    y: toNumber(row.depression_rate_pct),
  }));
}

export function buildPlatformInsight(data: PlatformData): InsightSummary {
  if (!data.labels.length) {
    return {
      title: 'Addiction Level by Platform',
      summary: 'Platform-level addiction insight will appear once data is available.',
    };
  }

  const ranked = data.labels
    .map((label, index) => ({
      label,
      avg: data.addiction[index],
      max: data.max[index],
      min: data.min[index],
    }))
    .sort((a, b) => b.avg - a.avg);

  const leader = ranked[0];
  const runnerUp = ranked[1];

  return {
    title: 'Addiction Level by Platform',
    summary: `${leader.label} has the highest average addiction level at ${leader.avg.toFixed(1)}, with reported scores ranging from ${leader.min} to ${leader.max}. ${runnerUp ? `It stays ahead of ${runnerUp.label} at ${runnerUp.avg.toFixed(1)}, making it the strongest platform signal in this dataset.` : 'It stands out as the leading platform in this dataset.'}`,
  };
}

export function buildInteractionInsight(data: InteractionData): InsightSummary {
  if (!data.labels.length) {
    return {
      title: 'Depression Rate by Interaction Group',
      summary: 'Interaction-based depression insight will appear once data is available.',
    };
  }

  const ranked = data.labels
    .map((label, index) => ({
      label,
      value: data.values[index],
    }))
    .sort((a, b) => b.value - a.value);

  const highest = ranked[0];
  const lowest = ranked[ranked.length - 1];

  return {
    title: 'Depression Rate by Interaction Group',
    summary: `${highest.label} social interaction shows the highest depression rate at ${highest.value.toFixed(1)}%, while ${lowest.label} is lowest at ${lowest.value.toFixed(1)}%. The spread is relatively small across groups, but ${highest.label} remains the clearest concentration point. This highlights a potential 'Social Fatigue' factor within the student cohort.`,
  };
}

export function buildUsageInsight(data: ScatterPoint[]): InsightSummary {
  if (!data.length) {
    return {
      title: 'Usage Hours vs. Depression Rate',
      summary: 'Usage-based depression insight will appear once data is available.',
    };
  }

  const peak = data.reduce((highest, point) => (point.y > highest.y ? point : highest), data[0]);
  const earlyUsage = data.filter((point) => point.x <= 4);
  const lateUsage = data.filter((point) => point.x >= 5);
  const earlyMax = earlyUsage.length ? Math.max(...earlyUsage.map((point) => point.y)) : 0;
  const lateStart = lateUsage[0];

  return {
    title: 'Usage Hours vs. Depression Rate',
    summary: `Depression rate stays at or below ${earlyMax.toFixed(1)}% through 4 hours of daily use, then rises to ${lateStart ? `${lateStart.y.toFixed(1)}% at ${lateStart.x} hours` : 'higher levels beyond 4 hours'} and peaks at ${peak.y.toFixed(1)}% at ${peak.x} hours. The pattern is not perfectly smooth hour by hour, but heavier usage clearly aligns with higher depression rates overall. This makes extended daily social media time the strongest risk signal in the chart.`,
  };
}
