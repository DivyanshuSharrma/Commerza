'use client';

interface StatsBarProps {
  stats?: Array<{ label: string; value: string }>;
}

export function StatsBar({ stats }: StatsBarProps) {
  const items = stats && stats.length > 0 ? stats : [
    { label: 'Verified Deliveries', value: '4,280+' },
    { label: 'Active Builders', value: '1,950+' },
    { label: 'Customer Rating', value: '4.98 / 5' },
    { label: 'Fulfillment Guarantee', value: '100% Instant' },
  ];

  return (
    <section className="border-b border-border/60 bg-surface-muted/40 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          {items.map((stat, i) => (
            <div key={i} className="space-y-1">
              <div className="text-2xl sm:text-3xl font-black text-foreground tracking-tight">
                {stat.value}
              </div>
              <div className="text-[11px] sm:text-xs font-semibold text-foreground/60 uppercase tracking-wider">
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
