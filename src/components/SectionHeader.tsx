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
