import { type LucideIcon } from 'lucide-react';

interface StatCardProps {
  label: string;
  value: string;
  delta?: string;
  deltaPositive?: boolean;
  icon?: LucideIcon;
}

export function StatCard({
  label, value, delta, deltaPositive = true,
  icon: Icon
}: StatCardProps) {
  return (
    <div className={`
      bg-card border border-mist-light rounded-md shadow-card
      p-5 flex flex-col gap-1.5 relative overflow-hidden
      transition-all duration-300 ease-out
      hover:-translate-y-0.5 hover:shadow-card-hover
    `}>
      {Icon && (
        <div className="absolute top-5 right-5 p-2 rounded-lg bg-sage-light/30 text-sage">
          <Icon size={20} />
        </div>
      )}
      
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
