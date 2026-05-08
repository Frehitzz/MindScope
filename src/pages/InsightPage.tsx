import { useEffect, useState } from 'react';
import { Smartphone, HeartHandshake, TrendingUp } from 'lucide-react';

import {
  fetchDashboardAggregateData,
  type InteractionData,
  type PlatformData,
  type ScatterPoint,
} from '../lib/dashboardAggregates';
import { ChartCard } from '../components/ChartCard';
import { SectionHeader } from '../components/SectionHeader';

function buildPlatformInsight(data: PlatformData) {
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

function buildInteractionInsight(data: InteractionData) {
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

function buildUsageInsight(data: ScatterPoint[]) {
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

export function InsightPage() {
  const [platformData, setPlatformData] = useState<PlatformData>({ labels: [], addiction: [], max: [], min: [] });
  const [interactionData, setInteractionData] = useState<InteractionData>({ labels: [], values: [] });
  const [scatterData, setScatterData] = useState<ScatterPoint[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchInsightData() {
      try {
        const aggregateData = await fetchDashboardAggregateData();
        setPlatformData(aggregateData.platformData);
        setInteractionData(aggregateData.interactionData);
        setScatterData(aggregateData.scatterData);
      } catch (error) {
        console.error('Error fetching insight data:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchInsightData();
  }, []);

  const insightCards = [
    {
      icon: Smartphone,
      colorClass: 'text-sage',
      ...buildPlatformInsight(platformData),
    },
    {
      icon: HeartHandshake,
      colorClass: 'text-dusk',
      ...buildInteractionInsight(interactionData),
    },
    {
      icon: TrendingUp,
      colorClass: 'text-sage',
      ...buildUsageInsight(scatterData),
    },
  ];

  return (
    <div className="space-y-7">
      <div>
        <h1 className="font-display text-3xl font-medium text-forest mb-1">Insight</h1>
        <p className="font-body text-sm text-text-muted">
          Real summaries generated from the dashboard chart results.
        </p>
      </div>

      <ChartCard>
        <SectionHeader title="Insight Summary" badge="Live Data" badgeVariant="dusk" />
        <div className="space-y-4">
          {loading ? (
            Array.from({ length: 3 }).map((_, index) => (
              <div key={index} className="rounded-md border border-mist-light bg-cream p-5 animate-pulse">
                <div className="mb-3 h-4 w-48 rounded bg-mist-light/60" />
                <div className="h-3 w-full rounded bg-mist-light/60" />
                <div className="mt-2 h-3 w-11/12 rounded bg-mist-light/60" />
                <div className="mt-2 h-3 w-10/12 rounded bg-mist-light/60" />
              </div>
            ))
          ) : (
            insightCards.map(({ icon: Icon, colorClass, title, summary }) => (
              <article key={title} className="rounded-md border border-mist-light bg-cream p-5">
                <div className="mb-3 flex items-center gap-3">
                  <Icon size={18} className={colorClass} />
                  <h2 className="font-display text-xl font-medium text-forest">{title}</h2>
                </div>
                <p className="font-body text-sm leading-7 text-text-body">{summary}</p>
              </article>
            ))
          )}
        </div>
      </ChartCard>
    </div>
  );
}
