import { useEffect, useState } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  ArcElement,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';
import { Bar, Line, Doughnut } from 'react-chartjs-2';
import { Activity, HeartPulse, Moon, Smartphone, Sparkles, HeartHandshake, TrendingUp } from 'lucide-react';

import { supabase } from '../lib/supabase';

import { StatCard } from '../components/StatCard';
import { SectionHeader } from '../components/SectionHeader';
import { ChartCard } from '../components/ChartCard';
import { CHART_COLORS } from '../constants/chartColors';
import {
  moodTrendData,
  stressTriggers,
  wellbeingBreakdown,
} from '../data/mockData';

// Register Chart.js modules
ChartJS.register(
  CategoryScale, LinearScale, BarElement,
  PointElement, LineElement, ArcElement,
  Tooltip, Legend, Filler,
);

const statIcons = [Activity, HeartPulse, Moon, Smartphone];

export function DashboardPage() {
  const [stats, setStats] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchStats() {
      try {
        const { data, error } = await supabase
          .from('teen_mental_health_cleaned')
          .select('stress_level, anxiety_level, sleep_hours, daily_social_media_hours');

        if (error) throw error;

        if (data && data.length > 0) {
          const totalRows = data.length;
          const sumStress = data.reduce((acc, row) => acc + (row.stress_level || 0), 0);
          const sumAnxiety = data.reduce((acc, row) => acc + (row.anxiety_level || 0), 0);
          const sumSleep = data.reduce((acc, row) => acc + (row.sleep_hours || 0), 0);
          const sumSocial = data.reduce((acc, row) => acc + (row.daily_social_media_hours || 0), 0);

          const maxStress = Math.max(...data.map(d => d.stress_level || 0));
          const maxAnxiety = Math.max(...data.map(d => d.anxiety_level || 0));
          const minSleep = Math.min(...data.map(d => d.sleep_hours || 0)).toFixed(1);
          const maxSleep = Math.max(...data.map(d => d.sleep_hours || 0)).toFixed(1);
          const maxSocial = Math.max(...data.map(d => d.daily_social_media_hours || 0)).toFixed(1);

          setStats([
            { label: 'Avg Stress Level', value: (sumStress / totalRows).toFixed(1), delta: `Max recorded: ${maxStress}`, deltaPositive: true },
            { label: 'Avg Anxiety Level', value: (sumAnxiety / totalRows).toFixed(1), delta: `Max recorded: ${maxAnxiety}`, deltaPositive: true },
            { label: 'Avg Sleep Hours', value: (sumSleep / totalRows).toFixed(1) + 'h', delta: `Range: ${minSleep}h - ${maxSleep}h`, deltaPositive: true },
            { label: 'Daily Social Media', value: (sumSocial / totalRows).toFixed(1) + 'h', delta: `Max: ${maxSocial}h/day`, deltaPositive: true },
          ]);
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
        {/* Mood Trend — Line */}
        <ChartCard>
          <SectionHeader title="Mood Trend" badge="12 months" />
          <div className="h-60">
            <Line
              data={{
                labels: moodTrendData.labels,
                datasets: [{
                  label: 'Average Mood',
                  data: moodTrendData.values,
                  borderColor: CHART_COLORS.primary,
                  backgroundColor: CHART_COLORS.primary + '18',
                  fill: true,
                  tension: 0.4,
                  pointRadius: 4,
                  pointBackgroundColor: '#fff',
                  pointBorderColor: CHART_COLORS.primary,
                  pointBorderWidth: 2,
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
                  },
                },
                scales: {
                  x: {
                    ticks: { color: CHART_COLORS.label, font: { family: '"Plus Jakarta Sans"', size: 11 } },
                    grid: { display: false },
                    border: { display: false },
                  },
                  y: {
                    min: 4, max: 8,
                    ticks: { color: CHART_COLORS.label, font: { family: '"Plus Jakarta Sans"', size: 11 } },
                    grid: { color: CHART_COLORS.grid },
                    border: { display: false },
                  },
                },
              }}
            />
          </div>
        </ChartCard>

        {/* Stress Triggers — Horizontal Bar */}
        <ChartCard>
          <SectionHeader title="Stress Triggers" badge="2026 Survey" badgeVariant="dusk" />
          <div className="h-60">
            <Bar
              data={{
                labels: stressTriggers.labels,
                datasets: [{
                  label: 'Responses (%)',
                  data: stressTriggers.values,
                  backgroundColor: ['#5C7A6B', '#6D8A7B', '#7D9A8B', '#8FAAAA', '#C47E72', '#D49080'],
                  borderRadius: 6,
                  maxBarThickness: 28,
                }],
              }}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                indexAxis: 'y',
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
                  },
                },
                scales: {
                  x: {
                    ticks: { color: CHART_COLORS.label, font: { family: '"Plus Jakarta Sans"', size: 11 } },
                    grid: { color: CHART_COLORS.grid },
                    border: { display: false },
                  },
                  y: {
                    ticks: { color: '#4A5E54', font: { family: '"Plus Jakarta Sans"', size: 12 } },
                    grid: { display: false },
                    border: { display: false },
                  },
                },
              }}
            />
          </div>
        </ChartCard>
      </div>

      {/* Wellbeing Doughnut + Insights */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <ChartCard>
          <SectionHeader title="Wellbeing Breakdown" />
          <div className="h-56 flex items-center justify-center">
            <Doughnut
              data={{
                labels: wellbeingBreakdown.labels,
                datasets: [{
                  data: wellbeingBreakdown.values,
                  backgroundColor: CHART_COLORS.series,
                  borderColor: '#FFFFFF',
                  borderWidth: 3,
                }],
              }}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                cutout: '65%',
                plugins: {
                  legend: {
                    position: 'bottom',
                    labels: {
                      color: CHART_COLORS.label,
                      font: { family: '"Plus Jakarta Sans"', size: 11 },
                      padding: 16,
                      usePointStyle: true,
                      pointStyleWidth: 10,
                    },
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
              }}
            />
          </div>
        </ChartCard>

        {/* Quick insight cards */}
        <div className="lg:col-span-2 bg-card border border-mist-light rounded-md shadow-card p-6">
          <SectionHeader title="Quick Insights" badge="AI Summary" badgeVariant="dusk" />
          <ul className="space-y-3 font-body text-sm text-text-body">
            <li className="flex items-start gap-3 bg-cream rounded-md p-4 border border-mist-light">
              <Sparkles size={18} className="text-sage shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-forest mb-1">Mood scores are trending upward</p>
                <p className="text-text-muted text-xs">Average mood has increased by 0.3 points over the last month, with the biggest gains in the 15–16 age group.</p>
              </div>
            </li>
            <li className="flex items-start gap-3 bg-cream rounded-md p-4 border border-mist-light">
              <HeartHandshake size={18} className="text-dusk shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-forest mb-1">Help-seeking is growing</p>
                <p className="text-text-muted text-xs">34% of respondents reported seeking help — a 5% increase from last quarter. School counselors remain the top resource.</p>
              </div>
            </li>
            <li className="flex items-start gap-3 bg-cream rounded-md p-4 border border-mist-light">
              <TrendingUp size={18} className="text-sage shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-forest mb-1">Academic stress still leads</p>
                <p className="text-text-muted text-xs">78% of teens cite academics as their top stressor. Consider expanding study support programs this semester.</p>
              </div>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
