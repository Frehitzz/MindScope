import { useEffect, useState } from 'react';
import { Smartphone, HeartHandshake, TrendingUp } from 'lucide-react';

import { fetchDashboardAggregateData } from '../lib/dashboardAggregates';
import {
  buildInteractionInsight,
  buildPlatformInsight,
  buildUsageInsight,
  type InteractionData,
  type PlatformData,
  type ScatterPoint,
} from '../lib/analytics';
import { ChartCard } from '../components/ChartCard';
import { SectionHeader } from '../components/SectionHeader';

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
