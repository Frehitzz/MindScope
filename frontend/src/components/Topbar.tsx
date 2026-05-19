import { Sun, Droplets, Heart } from 'lucide-react';

export function Topbar() {
  return (
    <header className="h-16 bg-card border-b border-mist-light flex items-center px-4 md:px-8 gap-3 md:gap-4">
      {/* Mobile Logo & Title */}
      <div className="flex items-center gap-2 md:hidden">
        <Heart size={20} className="text-dusk" />
        <span className="font-display text-xl italic font-semibold whitespace-nowrap text-forest">
          MindScope
        </span>
      </div>

      <div className="mr-auto" />

      {/* Weather chip (UI only) */}
      <div className="flex items-center gap-1.5 sm:gap-2 bg-card-alt border border-mist-light rounded-md px-2.5 py-1.5 sm:px-3.5 sm:py-1.5 font-body text-[11px] sm:text-[13px] text-text-body">
        <Sun size={13} className="text-text-muted sm:size-[14px]" />
        <span className="font-medium">28°C</span>
        <span className="hidden sm:inline text-text-muted">Partly Cloudy</span>
        <span className="hidden sm:inline w-px h-4 bg-mist-light mx-1" />
        <Droplets size={12} className="hidden sm:inline text-text-muted sm:size-[13px]" />
        <span className="hidden sm:inline">62%</span>
      </div>
    </header>
  );
}
