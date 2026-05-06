---
name: teen-mental-health-dashboard-frontend
description: >
  Create distinctive, compassionate, and production-grade React + Tailwind
  components and pages for a teenage mental health dashboard. Use this skill
  whenever building any UI — stat cards, charts, navigation, modals, badges,
  layout pages, or full dashboard views. The skill enforces the Sage & Dusk
  brand palette via Tailwind custom tokens, the Playfair Display / Plus Jakarta
  Sans type pair, and an emotional design tone that is safe, warm, and
  trustworthy. Trigger this skill for any React component or Tailwind-styled
  element belonging to this project, even small ones like buttons or chips.
---

# Teen Mental Health Dashboard — React + Tailwind Frontend Skill

A skill for building polished, empathetic UI using **React** and **Tailwind CSS v3/v4**.
Every design decision must balance **data clarity** with **emotional warmth** —
this covers a sensitive topic and the interface must feel safe, approachable,
and trustworthy for a teenage audience.

---

## Stack

| Layer | Choice |
|---|---|
| Framework | React 18+ (functional components, hooks only) |
| Styling | Tailwind CSS v3 or v4 with custom tokens |
| Charts | Recharts (preferred) — use brand colors via `CHART_COLORS` constant |
| Icons | `lucide-react` |
| Animation | Tailwind `animate-*` + `transition-*`; `framer-motion` for complex sequences |
| Fonts | Google Fonts — Playfair Display + Plus Jakarta Sans |

---

## Brand Palette — Sage & Dusk

A nature-grounded palette built for teen mental health. Sage green signals
growth and calm; cream canvas is easier on the eyes than pure white; dusk
terracotta provides warm accent energy without triggering alarm; forest anchors
headings with authority.

| Token | Hex | Role |
|---|---|---|
| `sage` | `#5C7A6B` | Sidebar bg, primary actions, chart primary |
| `sage-light` | `#EAF0EC` | Sidebar hover bg, chip/badge bg |
| `sage-dark` | `#3D5249` | Sidebar active state, deep hover |
| `cream` | `#FAF8F4` | Page background |
| `card` | `#FFFFFF` | Card surface |
| `card-alt` | `#F4F1EC` | Inset sections, alternate card bg |
| `forest` | `#243B2E` | Headings, primary text |
| `dusk` | `#C47E72` | Accent — terracotta rose |
| `dusk-light` | `#F7EAE7` | Accent bg tint for badges/chips |
| `mist` | `#8FA99A` | Secondary text, borders, dividers |
| `mist-light` | `#D9E4DE` | Chart grid lines, subtle dividers |
| `text-body` | `#4A5E54` | Body copy |
| `text-muted` | `#8FA99A` | Captions, labels, timestamps |

> ⚠️ Use **only** these tokens. For depth use Tailwind slash opacity notation:
> `bg-sage/10`, `border-mist/40`, `text-forest/70`, etc.
> Do NOT use default Tailwind color names (blue, gray, slate, etc).

---

## Tailwind Config — Custom Tokens

### Tailwind v3 — `tailwind.config.js`
```js
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        sage:        '#5C7A6B',
        'sage-light':'#EAF0EC',
        'sage-dark': '#3D5249',
        cream:       '#FAF8F4',
        card:        '#FFFFFF',
        'card-alt':  '#F4F1EC',
        forest:      '#243B2E',
        dusk:        '#C47E72',
        'dusk-light':'#F7EAE7',
        mist:        '#8FA99A',
        'mist-light':'#D9E4DE',
        'text-body': '#4A5E54',
        'text-muted':'#8FA99A',
      },
      fontFamily: {
        display: ['"Playfair Display"', 'Georgia', 'serif'],
        body:    ['"Plus Jakarta Sans"', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        DEFAULT: '14px',
        sm:  '8px',
        md:  '14px',
        lg:  '20px',
        xl:  '24px',
      },
      boxShadow: {
        card:        '0 2px 12px rgba(36,59,46,0.06)',
        'card-hover':'0 8px 28px rgba(36,59,46,0.10)',
      },
    },
  },
  plugins: [],
}
```

### Tailwind v4 — `globals.css` `@theme` block
```css
@import "tailwindcss";

@theme {
  --color-sage:        #5C7A6B;
  --color-sage-light:  #EAF0EC;
  --color-sage-dark:   #3D5249;
  --color-cream:       #FAF8F4;
  --color-card:        #FFFFFF;
  --color-card-alt:    #F4F1EC;
  --color-forest:      #243B2E;
  --color-dusk:        #C47E72;
  --color-dusk-light:  #F7EAE7;
  --color-mist:        #8FA99A;
  --color-mist-light:  #D9E4DE;
  --color-text-body:   #4A5E54;
  --color-text-muted:  #8FA99A;

  --font-display: "Playfair Display", Georgia, serif;
  --font-body:    "Plus Jakarta Sans", system-ui, sans-serif;
}
```

---

## Font Setup

In `index.html` or `_document.tsx`:
```html
<link rel="preconnect" href="https://fonts.googleapis.com" />
<link
  href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,500;0,600;1,500&family=Plus+Jakarta+Sans:wght@300;400;500;600&display=swap"
  rel="stylesheet"
/>
```

In your global CSS:
```css
body {
  font-family: theme('fontFamily.body');
  background-color: theme('colors.cream');
  color: theme('colors.forest');
}
```

**Typography rules:**
- Headings (`h1`–`h3`) → `font-display` (italic `font-display` for logo/brand moments)
- All UI copy, labels, numbers → `font-body`
- Never exceed `font-semibold` (600) on headings
- Use italic `font-display` sparingly — logo, page hero, emotional emphasis only

---

## Tailwind Class Reference

Quick lookup for the most-used patterns:

| Purpose | Tailwind classes |
|---|---|
| Page background | `bg-cream` |
| Card background | `bg-card` |
| Alternate / inset card | `bg-card-alt` |
| Card border | `border border-mist-light` |
| Card shadow | `shadow-card` |
| Card radius | `rounded-md` |
| Primary text (headings) | `text-forest` |
| Body copy | `text-text-body` |
| Muted / label text | `text-text-muted` |
| Primary chip / badge | `bg-sage-light text-sage-dark` |
| Accent chip / badge | `bg-dusk-light text-dusk` |
| Sidebar background | `bg-sage` |
| Sidebar nav text | `text-white/70` |
| Sidebar nav hover | `bg-white/10 text-white` |
| Sidebar nav active | `bg-white/20 text-white` |
| Stat card top accent bar | `border-t-2 border-sage` (vary per card) |
| Dividers | `border-mist-light` |
| Chart grid lines | `stroke-mist-light` |

---

## Component Patterns (React + Tailwind)

### Stat Card
```tsx
interface StatCardProps {
  label: string;
  value: string;
  delta?: string;
  deltaPositive?: boolean;
  accentColor?: string; // Tailwind border color class e.g. 'border-sage'
}

export function StatCard({
  label, value, delta, deltaPositive = true,
  accentColor = 'border-sage'
}: StatCardProps) {
  return (
    <div className={`
      bg-card border border-mist-light rounded-md shadow-card
      pt-0 px-5 pb-5 flex flex-col gap-1.5 relative overflow-hidden
      transition-all duration-300 ease-out
      hover:-translate-y-0.5 hover:shadow-card-hover
    `}>
      {/* Top accent stripe */}
      <div className={`h-[3px] w-full ${accentColor} bg-current -mx-5 mb-3`}
        style={{ marginLeft: '-1.25rem', marginRight: '-1.25rem', width: 'calc(100% + 2.5rem)' }}
      />
      <span className="font-body text-[11px] font-semibold text-text-muted uppercase tracking-[0.1em]">
        {label}
      </span>
      <span className="font-display text-[2.4rem] font-semibold text-forest leading-none">
        {value}
      </span>
      {delta && (
        <span className={`font-body text-xs ${deltaPositive ? 'text-sage-dark' : 'text-dusk'}`}>
          {delta}
        </span>
      )}
    </div>
  );
}
```

**Accent color variants per card position:**
```tsx
// Card 1 — sage (primary)
<StatCard accentColor="border-sage" ... />
// Card 2 — dusk (accent)
<StatCard accentColor="border-dusk" ... />
// Card 3 — mid sage
<StatCard accentColor="border-[#7B9E87]" ... />
// Card 4 — warm tan
<StatCard accentColor="border-[#B89F7A]" ... />
```

### Section Header
```tsx
interface SectionHeaderProps {
  title: string;
  badge?: string;
  badgeVariant?: 'sage' | 'dusk';
}

export function SectionHeader({
  title, badge, badgeVariant = 'sage'
}: SectionHeaderProps) {
  return (
    <header className="flex items-center gap-3 mb-5">
      <h2 className="font-display text-xl font-medium text-forest">{title}</h2>
      {badge && (
        <span className={`
          font-body text-[11px] font-semibold px-3 py-0.5 rounded-full tracking-wide
          ${badgeVariant === 'dusk'
            ? 'bg-dusk-light text-dusk'
            : 'bg-sage-light text-sage-dark'
          }
        `}>
          {badge}
        </span>
      )}
    </header>
  );
}
```

### Tag / Chip
```tsx
type ChipVariant = 'sage' | 'dusk' | 'neutral';

export function Chip({
  children, variant = 'sage'
}: { children: React.ReactNode; variant?: ChipVariant }) {
  const styles = {
    sage:    'bg-sage-light border border-sage/30 text-sage-dark',
    dusk:    'bg-dusk-light border border-dusk/30 text-dusk',
    neutral: 'bg-card-alt border border-mist-light text-text-body',
  };
  return (
    <span className={`
      inline-flex items-center gap-1 font-body text-[11px] font-semibold
      px-3 py-1 rounded-full tracking-wide ${styles[variant]}
    `}>
      {children}
    </span>
  );
}
```

### Navigation Sidebar
```tsx
import { type LucideIcon } from 'lucide-react';

interface NavItem {
  label: string;
  icon: LucideIcon;
  active?: boolean;
  onClick?: () => void;
}

interface SidebarSection {
  sectionLabel?: string;
  items: NavItem[];
}

export function Sidebar({ sections }: { sections: SidebarSection[] }) {
  return (
    <aside className="w-60 bg-sage h-screen flex flex-col px-4 py-7 shrink-0">
      {/* Logo */}
      <div className="flex items-center gap-2.5 px-3 mb-7">
        <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
          <Heart size={14} className="text-white" />
        </div>
        <span className="font-display italic text-white text-lg">MindScope</span>
      </div>

      {/* Nav sections */}
      {sections.map((section, si) => (
        <div key={si} className={si > 0 ? 'mt-5' : ''}>
          {section.sectionLabel && (
            <p className="font-body text-[10px] font-semibold uppercase tracking-[0.12em] text-white/45 px-3 mb-2">
              {section.sectionLabel}
            </p>
          )}
          {section.items.map(({ label, icon: Icon, active, onClick }) => (
            <button
              key={label}
              onClick={onClick}
              className={`
                flex items-center gap-2.5 px-3 py-2.5 rounded-md w-full text-left
                font-body text-[13.5px] font-medium mb-0.5
                transition-colors duration-200
                ${active
                  ? 'bg-white/20 text-white'
                  : 'text-white/70 hover:bg-white/10 hover:text-white'
                }
              `}
            >
              <Icon size={15} />
              {label}
            </button>
          ))}
        </div>
      ))}

      {/* Footer */}
      <div className="mt-auto rounded-md bg-white/10 p-3">
        <p className="font-body text-[11px] text-white/50 mb-0.5">Survey period</p>
        <p className="font-body text-[13px] text-white/90 font-medium">Jan – May 2026</p>
      </div>
    </aside>
  );
}
```

### Top Bar
```tsx
export function TopBar() {
  return (
    <header className="h-16 bg-card border-b border-mist-light flex items-center px-8 gap-4">
      {/* Logo */}
      <div className="flex items-center gap-2 mr-auto font-display italic text-forest text-[17px]">
        <Heart size={16} className="text-dusk" />
        MindScope
      </div>

      {/* Weather chip */}
      <div className="flex items-center gap-2 bg-card-alt border border-mist-light rounded-md px-3.5 py-1.5 text-[13px] text-text-body">
        <Sun size={14} className="text-text-muted" />
        <span className="font-medium">28°C</span>
        <span className="text-text-muted">Partly Cloudy</span>
        <span className="w-px h-4 bg-mist-light mx-1" />
        <Droplets size={13} className="text-text-muted" />
        <span>62%</span>
      </div>

      {/* Avatar */}
      <div className="w-9 h-9 rounded-full bg-sage flex items-center justify-center
        text-white font-body text-[13px] font-semibold cursor-pointer">
        AU
      </div>
    </header>
  );
}
```

### Dashboard Grid Layout
```tsx
export function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen bg-cream overflow-hidden">
      <Sidebar sections={NAV_SECTIONS} />
      <div className="flex flex-col flex-1 overflow-hidden">
        <TopBar />
        <main className="flex-1 overflow-y-auto p-9 space-y-7">
          {/* Stat row — 4 cards on lg, 2 on sm, 1 on mobile */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* <StatCard /> × 4 */}
          </div>
          {/* Chart row — line left (wider), bar right */}
          <div className="grid grid-cols-1 lg:grid-cols-[1.2fr_1fr] gap-5">
            {/* <MoodChart /> <StressChart /> */}
          </div>
        </main>
      </div>
    </div>
  );
}
```

### Chart Card Wrapper
```tsx
export function ChartCard({
  title, badge, badgeVariant = 'sage', children
}: {
  title: string;
  badge?: string;
  badgeVariant?: 'sage' | 'dusk';
  children: React.ReactNode;
}) {
  return (
    <div className="bg-card border border-mist-light rounded-md shadow-card p-6">
      <SectionHeader title={title} badge={badge} badgeVariant={badgeVariant} />
      {children}
    </div>
  );
}
```

---

## Recharts — Brand Color Config

Always import and use this constant — never hardcode hex values in chart props:

```tsx
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
};
```

**Mood trend line chart (Recharts):**
```tsx
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Area, AreaChart,
} from 'recharts';

export function MoodChart({ data }: { data: { month: string; score: number }[] }) {
  return (
    <ChartCard title="Mood Trend" badge="12 months">
      <ResponsiveContainer width="100%" height={240}>
        <AreaChart data={data} margin={{ top: 4, right: 8, left: -16, bottom: 0 }}>
          <defs>
            <linearGradient id="moodGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={CHART_COLORS.primary} stopOpacity={0.18} />
              <stop offset="100%" stopColor={CHART_COLORS.primary} stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid
            stroke={CHART_COLORS.grid} strokeWidth={0.8}
            vertical={false} strokeDasharray="0"
          />
          <XAxis
            dataKey="month" axisLine={false} tickLine={false}
            tick={{ fontFamily: '"Plus Jakarta Sans"', fontSize: 11, fill: CHART_COLORS.label }}
          />
          <YAxis
            domain={[4, 8]} axisLine={false} tickLine={false}
            tick={{ fontFamily: '"Plus Jakarta Sans"', fontSize: 11, fill: CHART_COLORS.label }}
          />
          <Tooltip
            contentStyle={{
              background: CHART_COLORS.tooltipBg, border: 'none',
              borderRadius: '12px', color: CHART_COLORS.tooltipText,
              fontFamily: '"Plus Jakarta Sans"', fontSize: 13, padding: '8px 12px',
            }}
            cursor={{ stroke: CHART_COLORS.grid, strokeWidth: 1 }}
          />
          <Area
            type="monotone" dataKey="score"
            stroke={CHART_COLORS.primary} strokeWidth={2.5}
            fill="url(#moodGrad)"
            dot={{ r: 4, fill: '#fff', stroke: CHART_COLORS.primary, strokeWidth: 2 }}
            activeDot={{ r: 6 }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </ChartCard>
  );
}
```

**Stress triggers horizontal bar chart (Recharts):**
```tsx
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Cell,
} from 'recharts';

const BAR_COLORS = [
  '#5C7A6B','#6D8A7B','#7D9A8B','#8FAAAA','#C47E72','#D49080'
];

export function StressChart({ data }: { data: { name: string; value: number }[] }) {
  return (
    <ChartCard title="Stress Triggers" badge="2026 Survey" badgeVariant="dusk">
      <ResponsiveContainer width="100%" height={240}>
        <BarChart
          data={data} layout="vertical"
          margin={{ top: 0, right: 8, left: 8, bottom: 0 }}
        >
          <CartesianGrid
            stroke={CHART_COLORS.grid} strokeWidth={0.8}
            horizontal={false}
          />
          <XAxis
            type="number" domain={[0, 100]} axisLine={false} tickLine={false}
            tick={{ fontFamily: '"Plus Jakarta Sans"', fontSize: 11, fill: CHART_COLORS.label }}
            tickFormatter={(v) => `${v}%`}
          />
          <YAxis
            type="category" dataKey="name" axisLine={false} tickLine={false}
            width={92}
            tick={{ fontFamily: '"Plus Jakarta Sans"', fontSize: 12, fill: '#4A5E54' }}
          />
          <Tooltip
            contentStyle={{
              background: CHART_COLORS.tooltipBg, border: 'none',
              borderRadius: '12px', color: CHART_COLORS.tooltipText,
              fontFamily: '"Plus Jakarta Sans"', fontSize: 13, padding: '8px 12px',
            }}
            formatter={(v) => [`${v}%`, 'Respondents']}
            cursor={{ fill: 'rgba(92,122,107,0.06)' }}
          />
          <Bar dataKey="value" radius={[0, 6, 6, 0]}>
            {data.map((_, i) => (
              <Cell key={i} fill={BAR_COLORS[i % BAR_COLORS.length]} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </ChartCard>
  );
}
```

---

## Animation Guidelines

Keep animations **gentle and purposeful** — this is a mental health context.
No bouncy, aggressive, or looping effects.

### Framer Motion — staggered card entrance
```tsx
import { motion } from 'framer-motion';

const cardVariants = {
  hidden:  { opacity: 0, y: 14 },
  visible: (i: number) => ({
    opacity: 1, y: 0,
    transition: { delay: i * 0.05, duration: 0.4, ease: 'easeOut' },
  }),
};

{cards.map((card, i) => (
  <motion.div key={card.id} custom={i} variants={cardVariants}
    initial="hidden" animate="visible">
    <StatCard {...card} />
  </motion.div>
))}
```

### Tailwind-only hover (no library needed)
```
hover:-translate-y-0.5 hover:shadow-card-hover transition-all duration-300 ease-out
```

**Rules:**
- Duration: `duration-200` to `duration-300` only
- Easing: `ease-out` always
- Entry: fade + subtle Y lift only (`y: 14 → 0`)
- Never use `animate-bounce`, `animate-spin`, or infinite loops

---

## Design Tone

| Principle | Implementation |
|---|---|
| **Safe** | `rounded-md` / `rounded-lg` everywhere; no `rounded-none` |
| **Clear** | Big stat number leads, label above it, delta below |
| **Warm** | Sage sidebar, cream page bg, dusk accent — never cold or clinical |
| **Trustworthy** | Consistent `gap-4`/`gap-5`, `p-6`/`p-9`; generous white space |
| **Empowering** | Positive framing in copy; avoid clinical or alarming language |

---

## Accessibility

- All text must meet **WCAG AA** contrast on its background
- Minimum touch target: `min-h-[44px] min-w-[44px]` on all interactive elements
- Icon-only buttons: always add `aria-label`
- Charts: add `aria-label` on `<canvas>` with a one-sentence data summary
- Never use color alone to convey meaning — always pair with an icon or label
- `forest` on `cream` = 10.4 : 1 ✓ | `sage` on `cream` = 4.8 : 1 ✓ | `dusk` on `cream` = 3.8 : 1 — use dusk only at 16px+ or for decorative elements

---

## Responsive Strategy (mobile-first)

| Breakpoint | Prefix | Stat grid | Chart grid |
|---|---|---|---|
| < 640px | (base) | 1 col | 1 col |
| ≥ 640px | `sm:` | 2 col | 1 col |
| ≥ 1024px | `lg:` | 4 col | `1.2fr 1fr` |

Sidebar: always visible on `lg:`, collapses to top nav below `lg:`.

---

## Do / Don't

| ✅ Do | ❌ Don't |
|---|---|
| Use only the Sage & Dusk color tokens | Add new colors or default Tailwind names |
| `font-display` for headings, `font-body` for UI | Use `font-sans` or system defaults |
| `rounded-md` / `rounded-lg` on all cards | Use `rounded-none` or sharp corners |
| `shadow-card` / `shadow-card-hover` | Use heavy or colored drop shadows |
| Opacity slash: `bg-sage/10`, `text-forest/70` | Hardcode `rgba()` in className |
| Sage chip for primary tags, dusk for accent tags | Mix chip colors randomly |
| Calm fade-up entry + gentle hover lift | `animate-bounce`, spin, or looping fx |
| Positive, empowering UI copy | Clinical or alarming language |
| Icon + label on all sidebar nav items | Icon-only nav without `aria-label` |
| `lucide-react` for all icons | Mix multiple icon libraries |

---

*Last updated: May 2026 — MindScope Teen Mental Health Dashboard (Sage & Dusk palette)*