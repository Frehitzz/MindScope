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

import { SectionHeader } from '../components/SectionHeader';
import { ChartCard } from '../components/ChartCard';
import { CHART_COLORS } from '../constants/chartColors';
import {
  monthlyEngagement,
  ageGroupDistribution,
  interventionEffectiveness,
  helpSeekingSources,
} from '../data/mockData';

ChartJS.register(
  CategoryScale, LinearScale, BarElement,
  PointElement, LineElement, ArcElement,
  Tooltip, Legend, Filler,
);

export function AnalyticsPage() {
  return (
    <div className="space-y-7">
      {/* Page heading */}
      <div>
        <h1 className="font-display text-3xl font-medium text-forest mb-1">Analytics</h1>
        <p className="font-body text-sm text-text-muted">
          Deep-dive into engagement, demographics, and intervention outcomes.
        </p>
      </div>

      {/* Row 1 — Engagement line chart + age distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <ChartCard>
          <SectionHeader title="Monthly Engagement" badge="2026" />
          <div className="h-72">
            <Line
              data={{
                labels: monthlyEngagement.labels,
                datasets: [
                  {
                    label: 'Check-ins',
                    data: monthlyEngagement.checkIns,
                    borderColor: CHART_COLORS.primary,
                    backgroundColor: CHART_COLORS.primary + '18',
                    fill: true,
                    tension: 0.4,
                    pointRadius: 3,
                    pointBackgroundColor: '#fff',
                    pointBorderColor: CHART_COLORS.primary,
                    pointBorderWidth: 2,
                  },
                  {
                    label: 'Resource Views',
                    data: monthlyEngagement.resources,
                    borderColor: CHART_COLORS.secondary,
                    backgroundColor: CHART_COLORS.secondary + '18',
                    fill: true,
                    tension: 0.4,
                    pointRadius: 3,
                    pointBackgroundColor: '#fff',
                    pointBorderColor: CHART_COLORS.secondary,
                    pointBorderWidth: 2,
                  },
                ],
              }}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: {
                    position: 'top',
                    align: 'end',
                    labels: {
                      color: CHART_COLORS.label,
                      font: { family: '"Plus Jakarta Sans"', size: 11 },
                      usePointStyle: true,
                      pointStyleWidth: 10,
                      padding: 20,
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
                scales: {
                  x: {
                    ticks: { color: CHART_COLORS.label, font: { family: '"Plus Jakarta Sans"', size: 11 } },
                    grid: { display: false },
                    border: { display: false },
                  },
                  y: {
                    ticks: { color: CHART_COLORS.label, font: { family: '"Plus Jakarta Sans"', size: 11 } },
                    grid: { color: CHART_COLORS.grid },
                    border: { display: false },
                  },
                },
              }}
            />
          </div>
        </ChartCard>

        <ChartCard>
          <SectionHeader title="Age Group Distribution" />
          <div className="h-72 flex items-center justify-center">
            <Doughnut
              data={{
                labels: ageGroupDistribution.labels,
                datasets: [{
                  data: ageGroupDistribution.values,
                  backgroundColor: [CHART_COLORS.primary, CHART_COLORS.secondary, CHART_COLORS.mid1],
                  borderColor: '#FFFFFF',
                  borderWidth: 3,
                }],
              }}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                cutout: '60%',
                plugins: {
                  legend: {
                    position: 'bottom',
                    labels: {
                      color: CHART_COLORS.label,
                      font: { family: '"Plus Jakarta Sans"', size: 11 },
                      padding: 20,
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
      </div>

      {/* Row 2 — Intervention effectiveness + help-seeking sources */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <ChartCard>
          <SectionHeader title="Intervention Effectiveness" badge="Before / After" badgeVariant="dusk" />
          <div className="h-72">
            <Bar
              data={{
                labels: interventionEffectiveness.labels,
                datasets: [
                  {
                    label: 'Before',
                    data: interventionEffectiveness.before,
                    backgroundColor: CHART_COLORS.mid2,
                    borderRadius: 6,
                    maxBarThickness: 28,
                  },
                  {
                    label: 'After',
                    data: interventionEffectiveness.after,
                    backgroundColor: CHART_COLORS.primary,
                    borderRadius: 6,
                    maxBarThickness: 28,
                  },
                ],
              }}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: {
                    position: 'top',
                    align: 'end',
                    labels: {
                      color: CHART_COLORS.label,
                      font: { family: '"Plus Jakarta Sans"', size: 11 },
                      usePointStyle: true,
                      pointStyleWidth: 10,
                      padding: 20,
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
                scales: {
                  x: {
                    ticks: { color: CHART_COLORS.label, font: { family: '"Plus Jakarta Sans"', size: 11 } },
                    grid: { display: false },
                    border: { display: false },
                  },
                  y: {
                    min: 0, max: 8,
                    ticks: { color: CHART_COLORS.label, font: { family: '"Plus Jakarta Sans"', size: 11 } },
                    grid: { color: CHART_COLORS.grid },
                    border: { display: false },
                  },
                },
              }}
            />
          </div>
        </ChartCard>

        <ChartCard>
          <SectionHeader title="Help-Seeking Sources" badge="Survey" />
          <div className="h-72">
            <Bar
              data={{
                labels: helpSeekingSources.labels,
                datasets: [{
                  label: 'Percentage (%)',
                  data: helpSeekingSources.values,
                  backgroundColor: CHART_COLORS.series,
                  borderRadius: 6,
                  maxBarThickness: 40,
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
                    ticks: { color: CHART_COLORS.label, font: { family: '"Plus Jakarta Sans"', size: 11 } },
                    grid: { color: CHART_COLORS.grid },
                    border: { display: false },
                  },
                },
              }}
            />
          </div>
        </ChartCard>
      </div>
    </div>
  );
}
