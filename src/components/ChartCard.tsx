import type { ReactNode } from 'react';

interface ChartCardProps {
  children: ReactNode;
}

export function ChartCard({ children }: ChartCardProps) {
  return (
    <div className="
      bg-card border border-mist-light rounded-md shadow-card
      p-6 transition-all duration-300 ease-out
      hover:shadow-card-hover
    ">
      {children}
    </div>
  );
}
