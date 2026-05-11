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
    <>
      <aside
        className={`
          relative hidden h-screen shrink-0 flex-col bg-sage transition-all duration-300 ease-out md:flex
          ${collapsed ? 'w-[72px]' : 'w-60'}
        `}
      >
        <div className="mb-4 flex h-16 items-center gap-3 px-6 shrink-0">
          <Heart size={25} className="text-dusk" />
          {!collapsed && (
            <span className="font-display text-2xl italic whitespace-nowrap text-white">
              MindScope
            </span>
          )}
        </div>

        {!collapsed && (
          <p className="mb-2 px-6 font-body text-[10px] font-semibold uppercase tracking-[0.12em] text-white/45">
            Menu
          </p>
        )}

        <nav className="flex flex-1 flex-col gap-0.5 px-3">
          {navItems.map(({ label, icon: Icon, to }) => (
            <NavLink
              key={label}
              to={to}
              className={({ isActive }) =>
                `flex min-h-[44px] min-w-[44px] w-full items-center gap-2.5 rounded-md px-3 py-2.5 text-left
                 font-body text-[13.5px] font-medium transition-colors duration-200
                 ${isActive
                  ? 'bg-white/20 text-white'
                  : 'text-white/70 hover:bg-white/10 hover:text-white'}
                 ${collapsed ? 'justify-center px-0' : ''}`
              }
              aria-label={collapsed ? label : undefined}
            >
              <Icon size={15} className="shrink-0" />
              {!collapsed && <span>{label}</span>}
            </NavLink>
          ))}
        </nav>

        {!collapsed && (
          <div className="mx-3 mb-4 rounded-md bg-white/10 p-3">
            <p className="mb-0.5 font-body text-[11px] text-white/50">Survey period</p>
            <p className="font-body text-[13px] font-medium text-white/90">Jan - May 2026</p>
          </div>
        )}

        <button
          onClick={() => setCollapsed(!collapsed)}
          className="mx-3 mb-4 flex min-h-[44px] min-w-[44px] items-center justify-center rounded-md text-white/40 transition-colors duration-200 hover:bg-white/10 hover:text-white"
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
        </button>
      </aside>

      <nav className="fixed inset-x-0 bottom-0 z-50 border-t border-white/10 bg-sage/95 px-2 py-2 backdrop-blur md:hidden">
        <div className="grid grid-cols-3 gap-1">
          {navItems.map(({ label, icon: Icon, to }) => (
            <NavLink
              key={label}
              to={to}
              className={({ isActive }) =>
                `flex min-h-[56px] flex-col items-center justify-center gap-1 rounded-xl px-2 py-2
                 font-body text-[11px] font-medium transition-colors duration-200
                 ${isActive
                  ? 'bg-white/20 text-white'
                  : 'text-white/70 hover:bg-white/10 hover:text-white'}`
              }
            >
              <Icon size={18} className="shrink-0" />
              <span className="leading-none">{label}</span>
            </NavLink>
          ))}
        </div>
      </nav>
    </>
  );
}
