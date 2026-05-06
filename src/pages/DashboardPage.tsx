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
import { ClipboardList, Smile, HeartHandshake, Sparkles, TrendingUp, Users } from 'lucide-react';

import { StatCard } from '../components/StatCard';
import { SectionHeader } from '../components/SectionHeader';
import { ChartCard } from '../components/ChartCard';
import { CHART_COLORS } from '../constants/chartColors';
import {
  statsOverview,
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

const statIcons = [ClipboardList, Smile, HeartHandshake, Sparkles];

export function DashboardPage() {
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
        {statsOverview.map((stat, i) => (
          <StatCard 
            key={stat.label} 
            {...stat} 
            icon={statIcons[i]} 
          />
        ))}
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
                  backgroundColor: ['#5C7A6B','#6D8A7B','#7D9A8B','#8FAAAA','#C47E72','#D49080'],
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
