import { useState } from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  BarChart3,
  Table2,
  ChevronLeft,
  ChevronRight,
  Heart,
} from 'lucide-react';

const navItems = [
  { label: 'Dashboard', icon: LayoutDashboard, to: '/' },
  { label: 'Insight', icon: BarChart3, to: '/insight' },
  { label: 'Data Table', icon: Table2, to: '/data-table' },
];

export function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <aside
      className={`
        flex flex-col bg-sage h-screen shrink-0
        transition-all duration-300 ease-out relative
        ${collapsed ? 'w-[72px]' : 'w-60'}
      `}
    >
      {/* Brand */}
      <div className="h-16 flex items-center gap-3 px-6 mb-4 shrink-0">
        <Heart size={25} className="text-dusk" />
        {!collapsed && (
          <span className="font-display italic text-white text-2xl whitespace-nowrap">
            MindScope
          </span>
        )}
      </div>

      {/* Section label */}
      {!collapsed && (
        <p className="font-body text-[10px] font-semibold uppercase tracking-[0.12em] text-white/45 px-6 mb-2">
          Menu
        </p>
      )}

      {/* Navigation */}
      <nav className="flex flex-col gap-0.5 px-3 flex-1">
        {navItems.map(({ label, icon: Icon, to }) => (
          <NavLink
            key={label}
            to={to}
            className={({ isActive }) =>
              `flex items-center gap-2.5 px-3 py-2.5 rounded-md
               font-body text-[13.5px] font-medium transition-colors duration-200 w-full text-left
               min-h-[44px] min-w-[44px]
               ${isActive
                ? 'bg-white/20 text-white'
                : 'text-white/70 hover:bg-white/10 hover:text-white'
              }
               ${collapsed ? 'justify-center px-0' : ''}
              `
            }
            aria-label={collapsed ? label : undefined}
          >
            <Icon size={15} className="shrink-0" />
            {!collapsed && <span>{label}</span>}
          </NavLink>
        ))}
      </nav>

      {/* Footer info */}
      {!collapsed && (
        <div className="mx-3 mb-4 rounded-md bg-white/10 p-3">
          <p className="font-body text-[11px] text-white/50 mb-0.5">Survey period</p>
          <p className="font-body text-[13px] text-white/90 font-medium">Jan – May 2026</p>
        </div>
      )}

      {/* Collapse toggle */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="
          flex items-center justify-center
          min-h-[44px] min-w-[44px] mx-3 mb-4
          rounded-md text-white/40 hover:text-white hover:bg-white/10
          transition-colors duration-200
        "
        aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
      >
        {collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
      </button>
    </aside>
  );
}
