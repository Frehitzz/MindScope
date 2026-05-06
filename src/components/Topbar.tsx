import { Sun, Droplets, Heart } from 'lucide-react';

export function Topbar() {
  return (
    <header className="h-16 bg-card border-b border-mist-light flex items-center px-8 gap-4">
      {/* Left — spacer or breadcrumbs could go here */}
      <div className="mr-auto" />

      {/* Weather chip (UI only) */}
      <div className="flex items-center gap-2 bg-card-alt border border-mist-light rounded-md px-3.5 py-1.5 font-body text-[13px] text-text-body">
        <Sun size={14} className="text-text-muted" />
        <span className="font-medium">28°C</span>
        <span className="text-text-muted">Partly Cloudy</span>
        <span className="w-px h-4 bg-mist-light mx-1" />
        <Droplets size={13} className="text-text-muted" />
        <span>62%</span>
      </div>

      {/* Avatar */}
      <div className="
        w-9 h-9 rounded-full bg-sage flex items-center justify-center
        text-white font-body text-[13px] font-semibold cursor-pointer
      ">
        AU
      </div>
    </header>
  );
}
