/** Brand color palette for Chart.js — never hardcode hex in chart props */
export const CHART_COLORS = {
  primary:    '#5C7A6B',  // sage        — main data series / bars
  secondary:  '#C47E72',  // dusk        — comparison / accent series
  mid1:       '#7B9E87',  // sage mid    — 3rd series
  mid2:       '#B89F7A',  // warm tan    — 4th series
  grid:       '#D9E4DE',  // mist-light  — grid lines
  label:      '#8FA99A',  // mist / text-muted — axis labels
  background: '#FAF8F4',  // cream       — chart background
  tooltipBg:  '#243B2E',  // forest      — tooltip background
  tooltipText:'#FAF8F4',  // cream       — tooltip text
  series: ['#5C7A6B', '#C47E72', '#7B9E87', '#B89F7A'],
} as const;
