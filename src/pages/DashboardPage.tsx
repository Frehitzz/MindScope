import { useEffect, useState } from 'react';
import {
  Chart as ChartJS,
  type Chart,
  type ChartOptions,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  ArcElement,
  type Plugin,
  type ScatterDataPoint,
  type TooltipItem,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';
import { Bar, Line, Scatter } from 'react-chartjs-2';
import { Activity, HeartPulse, Moon, Smartphone, HeartHandshake, TrendingUp } from 'lucide-react';

import { supabase } from '../lib/supabase';

import { StatCard } from '../components/StatCard';
import { SectionHeader } from '../components/SectionHeader';
import { ChartCard } from '../components/ChartCard';
import { CHART_COLORS } from '../constants/chartColors';

type DashboardRow = {
  stress_level: number | null;
  anxiety_level: number | null;
  sleep_hours: number | null;
  daily_social_media_hours: number | null;
  platform_usage: string | null;
  addiction_level: number | null;
  social_interaction_level: string | null;
  depression_label: number | null;
};

type Stat = {
  label: string;
  value: string;
  delta: string;
  deltaPositive: boolean;
};

type PlatformData = {
  labels: string[];
  addiction: number[];
  max: number[];
  min: number[];
};

type InteractionData = {
  labels: string[];
  values: number[];
};

type LollipopStemPluginOptions = {
  enabled?: boolean;
  baselineValue?: number;
  stemColor?: string;
  stemWidth?: number;
};

type ScatterChartOptions = ChartOptions<'scatter'> & {
  plugins?: NonNullable<ChartOptions<'scatter'>['plugins']> & {
    lollipopStemPlugin?: LollipopStemPluginOptions;
  };
};

const lollipopStemPlugin: Plugin<'scatter'> = {
  id: 'lollipopStemPlugin',
  afterDatasetsDraw(chart: Chart<'scatter'>) {
    const pluginOptions = (chart.options.plugins as ScatterChartOptions['plugins'])?.lollipopStemPlugin;
    if (!pluginOptions?.enabled) return;

    const datasetMeta = chart.getDatasetMeta(0);
    const yScale = chart.scales.y;
    if (!datasetMeta?.data?.length || !yScale) return;

    const ctx = chart.ctx;
    const baselinePixel = yScale.getPixelForValue(pluginOptions.baselineValue ?? 0);

    ctx.save();
    ctx.strokeStyle = pluginOptions.stemColor ?? CHART_COLORS.mid1;
    ctx.lineWidth = pluginOptions.stemWidth ?? 3;
    ctx.lineCap = 'round';

    datasetMeta.data.forEach((point) => {
      ctx.beginPath();
      ctx.moveTo(point.x, baselinePixel);
      ctx.lineTo(point.x, point.y);
      ctx.stroke();
    });

    ctx.restore();
  },
};

// Register Chart.js modules
ChartJS.register(
  CategoryScale, LinearScale, BarElement,
  PointElement, LineElement, ArcElement,
  Tooltip, Legend, Filler, lollipopStemPlugin,
);

const statIcons = [Activity, HeartPulse, Moon, Smartphone];

export function DashboardPage() {
  const [stats, setStats] = useState<Stat[]>([]);
  const [platformData, setPlatformData] = useState<PlatformData>({ labels: [], addiction: [], max: [], min: [] });
  const [interactionData, setInteractionData] = useState<InteractionData>({ labels: [], values: [] });
  const [scatterData, setScatterData] = useState<ScatterDataPoint[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchStats() {
      try {
        const { data, error } = await supabase
          .from('teen_mental_health_cleaned')
          .select('stress_level, anxiety_level, sleep_hours, daily_social_media_hours, platform_usage, addiction_level, social_interaction_level, depression_label');

        if (error) throw error;

        const rows = (data ?? []) as DashboardRow[];

        if (rows.length > 0) {
          const totalRows = rows.length;
          const sumStress = rows.reduce((acc, row) => acc + (row.stress_level || 0), 0);
          const sumAnxiety = rows.reduce((acc, row) => acc + (row.anxiety_level || 0), 0);
          const sumSleep = rows.reduce((acc, row) => acc + (row.sleep_hours || 0), 0);
          const sumSocial = rows.reduce((acc, row) => acc + (row.daily_social_media_hours || 0), 0);

          const maxStress = Math.max(...rows.map(d => d.stress_level || 0));
          const maxAnxiety = Math.max(...rows.map(d => d.anxiety_level || 0));
          const minSleep = Math.min(...rows.map(d => d.sleep_hours || 0)).toFixed(1);
          const maxSleep = Math.max(...rows.map(d => d.sleep_hours || 0)).toFixed(1);
          const maxSocial = Math.max(...rows.map(d => d.daily_social_media_hours || 0)).toFixed(1);

          setStats([
            { label: 'Avg Stress Level', value: (sumStress / totalRows).toFixed(1), delta: `Max recorded: ${maxStress}`, deltaPositive: true },
            { label: 'Avg Anxiety Level', value: (sumAnxiety / totalRows).toFixed(1), delta: `Max recorded: ${maxAnxiety}`, deltaPositive: true },
            { label: 'Avg Sleep Hours', value: (sumSleep / totalRows).toFixed(1) + 'h', delta: `Range: ${minSleep}h - ${maxSleep}h`, deltaPositive: true },
            { label: 'Daily Social Media', value: (sumSocial / totalRows).toFixed(1) + 'h', delta: `Max: ${maxSocial}h/day`, deltaPositive: true },
          ]);

          // Calculate averages grouped by platform for the bar chart
          const groupedByPlatform = rows.reduce((acc, row) => {
            const platformStr = row.platform_usage ? String(row.platform_usage).trim() : 'Unknown';
            const formattedPlatform = platformStr.charAt(0).toUpperCase() + platformStr.slice(1).toLowerCase();

            const addiction = row.addiction_level || 0;
            if (!acc[formattedPlatform]) acc[formattedPlatform] = { count: 0, sumAddiction: 0, max: -Infinity, min: Infinity };
            acc[formattedPlatform].count++;
            acc[formattedPlatform].sumAddiction += addiction;
            if (addiction > acc[formattedPlatform].max) acc[formattedPlatform].max = addiction;
            if (addiction < acc[formattedPlatform].min) acc[formattedPlatform].min = addiction;
            return acc;
          }, {} as Record<string, { count: number, sumAddiction: number, max: number, min: number }>);

          const labels = Object.keys(groupedByPlatform);
          const addictionAverages = labels.map(p => Number((groupedByPlatform[p].sumAddiction / groupedByPlatform[p].count).toFixed(1)));
          const maxAddictions = labels.map(p => groupedByPlatform[p].max);
          const minAddictions = labels.map(p => groupedByPlatform[p].min);

          setPlatformData({ labels, addiction: addictionAverages, max: maxAddictions, min: minAddictions });

          // Calculate depression rate grouped by social interaction level
          const groupedByInteraction = rows.reduce((acc, row) => {
            const levelStr = row.social_interaction_level ? String(row.social_interaction_level).trim().toLowerCase() : 'unknown';
            const formattedLevel = levelStr.charAt(0).toUpperCase() + levelStr.slice(1);

            if (!acc[formattedLevel]) acc[formattedLevel] = { count: 0, sumDepression: 0 };
            acc[formattedLevel].count++;
            acc[formattedLevel].sumDepression += (row.depression_label || 0);
            return acc;
          }, {} as Record<string, { count: number, sumDepression: number }>);

          const interactionLabels = Object.keys(groupedByInteraction);
          const depressionRates = interactionLabels.map(l =>
            ((groupedByInteraction[l].sumDepression / groupedByInteraction[l].count) * 100).toFixed(1)
          );

          setInteractionData({ labels: interactionLabels, values: depressionRates.map(Number) });

          // Calculate scatter points: Usage Hours (X) vs Depression Rate (Y)
          const groupedByHours = rows.reduce((acc, row) => {
            const hours = Math.round(row.daily_social_media_hours || 0);
            if (!acc[hours]) acc[hours] = { count: 0, sumDepression: 0 };
            acc[hours].count++;
            acc[hours].sumDepression += (row.depression_label || 0);
            return acc;
          }, {} as Record<number, { count: number, sumDepression: number }>);

          const scatterPoints = Object.keys(groupedByHours).map(h => ({
            x: Number(h),
            y: Number(((groupedByHours[Number(h)].sumDepression / groupedByHours[Number(h)].count) * 100).toFixed(1))
          })).sort((a, b) => a.x - b.x);

          setScatterData(scatterPoints);
        } else {
          console.warn('No data found in teen_mental_health_cleaned table.');
        }
      } catch (err) {
        console.error('Error fetching Supabase data:', err);
        // Fallback to mock data if fetch fails (e.g., if .env is missing)
        setStats([
          { label: 'Avg Stress Level', value: 'Error', delta: 'Could not fetch data', deltaPositive: true },
          { label: 'Avg Anxiety Level', value: 'Error', delta: 'Could not fetch data', deltaPositive: true },
          { label: 'Avg Sleep Hours', value: 'Error', delta: 'Could not fetch data', deltaPositive: true },
          { label: 'Avg Social Media Usage', value: 'Error', delta: 'Could not fetch data', deltaPositive: true },
        ]);
      } finally {
        setLoading(false);
      }
    }

    fetchStats();
  }, []);

  const interactionChartOptions: ScatterChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    layout: {
      padding: { top: 8, right: 8, bottom: 0, left: 0 },
    },
    plugins: {
      lollipopStemPlugin: {
        enabled: true,
        baselineValue: 0,
        stemColor: CHART_COLORS.mid1,
        stemWidth: 4,
      },
      legend: {
        display: false,
      },
      tooltip: {
        backgroundColor: CHART_COLORS.tooltipBg,
        titleFont: { family: '"Plus Jakarta Sans"' },
        bodyFont: { family: '"Plus Jakarta Sans"' },
        bodyColor: CHART_COLORS.tooltipText,
        titleColor: CHART_COLORS.tooltipText,
        cornerRadius: 12,
        padding: 12,
        callbacks: {
          label(context: TooltipItem<'scatter'>) {
            const point = context.raw as ScatterDataPoint;
            return ` ${String(point.x)}: ${point.y}%`;
          }
        }
      }
    },
    scales: {
      x: {
        type: 'category',
        labels: interactionData.labels,
        ticks: {
          color: CHART_COLORS.label,
          font: { family: '"Plus Jakarta Sans"', size: 11 },
        },
        grid: { display: false },
        border: { display: false },
      },
      y: {
        beginAtZero: true,
        ticks: {
          color: CHART_COLORS.label,
          font: { family: '"Plus Jakarta Sans"', size: 11 },
          callback(value: string | number) {
            return `${value}%`;
          }
        },
        title: {
          display: true,
          text: 'Depression Rate (%)',
          color: CHART_COLORS.label,
        },
        grid: { color: CHART_COLORS.grid },
        border: { display: false },
      },
    },
  };

  return (
    <div className="space-y-7">
      {/* Page heading */}
      <div>
        <h1 className="font-display text-3xl font-medium text-forest mb-1">Welcome back</h1>
        <p className="font-body text-sm text-text-muted">
          Here's an overview of teen wellbeing insights this month.
        </p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {loading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="bg-card border border-mist-light rounded-md shadow-card p-5 h-[116px] animate-pulse flex flex-col gap-2 relative">
              <div className="h-3 bg-mist-light/60 rounded w-1/3 mb-2"></div>
              <div className="h-8 bg-mist-light/60 rounded w-1/2"></div>
              <div className="h-3 bg-mist-light/60 rounded w-2/3 mt-auto"></div>
              <div className="absolute top-5 right-5 w-8 h-8 rounded-lg bg-mist-light/40"></div>
            </div>
          ))
        ) : (
          stats.map((stat, i) => (
            <StatCard
              key={stat.label}
              {...stat}
              icon={statIcons[i]}
            />
          ))
        )}
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-[1.2fr_1fr] gap-5">
        {/* Addiction by Platform — Bar */}
        <ChartCard>
          <SectionHeader title="Avg. Addiction Level by Platform" badge="Live Data" />
          <div className="h-60">
            {loading ? (
              <div className="w-full h-full bg-mist-light/30 animate-pulse rounded-md" />
            ) : (
              <Bar
                data={{
                  labels: platformData.labels,
                  datasets: [
                    {
                      label: 'Avg Addiction Level',
                      data: platformData.addiction,
                      backgroundColor: CHART_COLORS.secondary, // Dusk
                      borderRadius: 4,
                    },
                    {
                      label: 'Highest',
                      data: platformData.max,
                      backgroundColor: CHART_COLORS.primary, // Sage
                      borderRadius: 4,
                    },
                    {
                      label: 'Lowest',
                      data: platformData.min,
                      backgroundColor: CHART_COLORS.mid1, // Sage Mid
                      borderRadius: 4,
                    }
                  ],
                }}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    legend: {
                      display: true,
                      position: 'top',
                      labels: {
                        color: CHART_COLORS.label,
                        font: { family: '"Plus Jakarta Sans"', size: 11 },
                        usePointStyle: true,
                        boxWidth: 8,
                      }
                    },
                    tooltip: {
                      backgroundColor: CHART_COLORS.tooltipBg,
                      titleFont: { family: '"Plus Jakarta Sans"' },
                      bodyFont: { family: '"Plus Jakarta Sans"' },
                      bodyColor: CHART_COLORS.tooltipText,
                      titleColor: CHART_COLORS.tooltipText,
                      cornerRadius: 12,
                      padding: 12,
                    },
                  },
                  scales: {
                    x: {
                      ticks: { color: CHART_COLORS.label, font: { family: '"Plus Jakarta Sans"', size: 11 } },
                      grid: { display: false },
                      border: { display: false },
                    },
                    y: {
                      min: 0,
                      ticks: { color: CHART_COLORS.label, font: { family: '"Plus Jakarta Sans"', size: 11 } },
                      grid: { color: CHART_COLORS.grid },
                      border: { display: false },
                    },
                  },
                }}
              />
            )}
          </div>
        </ChartCard>

        {/* Depression Rate by Interaction Group — Pie */}
        <ChartCard>
          <SectionHeader title="Depression Rate by Interaction Group" badge="Live Data" />
          <div className="h-60">
            {loading ? (
              <div className="w-full h-full bg-mist-light/30 animate-pulse rounded-md" />
            ) : (
              <Scatter
                data={{
                  datasets: [{
                    label: 'Depression Rate (%)',
                    data: interactionData.labels.map((label, index) => ({
                      x: label,
                      y: interactionData.values[index],
                    })),
                    pointRadius: 8,
                    pointHoverRadius: 10,
                    pointBackgroundColor: CHART_COLORS.secondary,
                    pointBorderColor: '#FFFFFF',
                    pointBorderWidth: 2,
                  }],
                }}
                options={interactionChartOptions}
              />
            )}
          </div>
        </ChartCard>
      </div>

      {/* Usage Scatter + Insights */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <div className="lg:col-span-1">
          <ChartCard>
            <SectionHeader title="Usage Hours vs. Depression Rate" badge="Live Data" />
            <div className="h-64 flex items-center justify-center">
              {loading ? (
                <div className="w-full h-full bg-mist-light/30 animate-pulse rounded-md" />
              ) : (
                <Line
                  data={{
                    datasets: [{
                      label: 'Depression Rate (%)',
                      data: scatterData,
                      borderColor: CHART_COLORS.primary,
                      backgroundColor: CHART_COLORS.primary + '18',
                      fill: true,
                      tension: 0.4,
                      pointRadius: 6,
                      pointHoverRadius: 8,
                      pointBackgroundColor: CHART_COLORS.primary,
                      pointBorderColor: '#FFFFFF',
                      pointBorderWidth: 1.5,
                    }],
                  }}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                      legend: { display: false },
                      tooltip: {
                        backgroundColor: CHART_COLORS.tooltipBg,
                        titleFont: { family: '"Plus Jakarta Sans"' },
                        bodyFont: { family: '"Plus Jakarta Sans"' },
                        bodyColor: CHART_COLORS.tooltipText,
                        titleColor: CHART_COLORS.tooltipText,
                        cornerRadius: 12,
                        padding: 12,
                        callbacks: {
                          label(context: TooltipItem<'line'>) {
                            const point = context.raw as ScatterDataPoint;
                            return ` ${point.x}h usage: ${point.y}% depression rate`;
                          }
                        }
                      },
                    },
                    scales: {
                      x: {
                        type: 'linear',
                        title: { display: true, text: 'Daily Social Media Hours', color: CHART_COLORS.label },
                        min: 1,
                        max: 8,
                        offset: true,
                        ticks: { color: CHART_COLORS.label, font: { family: '"Plus Jakarta Sans"', size: 11 } },
                        grid: { color: CHART_COLORS.grid },
                        border: { display: false },
                      },
                      y: {
                        title: { display: true, text: 'Depression Rate (%)', color: CHART_COLORS.label },
                        min: 0,
                        max: 10,
                        offset: true,
                        ticks: { color: CHART_COLORS.label, font: { family: '"Plus Jakarta Sans"', size: 11 } },
                        grid: { color: CHART_COLORS.grid },
                        border: { display: false },
                      },
                    },
                  }}
                />
              )}
            </div>
          </ChartCard>
        </div>

        {/* Quick insight cards */}
        <div className="lg:col-span-1 bg-card border border-mist-light rounded-md shadow-card p-6 overflow-y-auto">
          <SectionHeader title="Quick Insights" badge="Chart Guide" badgeVariant="dusk" />
          <ul className="space-y-3 font-body text-sm text-text-body">
            <li className="flex items-start gap-3 bg-cream rounded-md p-4 border border-mist-light">
              <Smartphone size={18} className="text-sage shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-forest mb-1">Platform Addiction</p>
                <p className="text-text-muted text-xs">Displays the average, highest, and lowest addiction levels reported by teens across different social media platforms.</p>
              </div>
            </li>
            <li className="flex items-start gap-3 bg-cream rounded-md p-4 border border-mist-light">
              <HeartHandshake size={18} className="text-dusk shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-forest mb-1">Interaction & Depression</p>
                <p className="text-text-muted text-xs">Shows the percentage of teens with a depression label within each social interaction group (Low, Medium, High).</p>
              </div>
            </li>
            <li className="flex items-start gap-3 bg-cream rounded-md p-4 border border-mist-light">
              <TrendingUp size={18} className="text-sage shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium text-forest mb-1">Usage Hours vs. Rate</p>
                  <p className="text-text-muted text-xs">Tracks how depression rates change in relation to the number of daily hours spent on social media, grouped by rounded hour.</p>
                </div>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
