'use client';

export function AppleMatrix() {
  const pillars = [
    {
      title: 'Perpetual Ownership',
      subtitle: 'Zero subscription locks.',
      description:
        'Pay once, receive the complete production repository and source tokens. Deploy forever without ongoing monthly fees or seat restrictions.',
      icon: '💎',
      badge: 'PROD_PERPETUAL',
    },
    {
      title: 'Instant Vault Delivery',
      subtitle: 'Signed cryptographic dispatch.',
      description:
        'Orders emit time-bounded, tamper-proof download tokens instantly to your screen and confirmation email in less than 2 seconds.',
      icon: '⚡',
      badge: 'VAULT_DISPATCH',
    },
    {
      title: 'Precision Craft',
      subtitle: 'Strict architecture standards.',
      description:
        'Decoupled domain repositories, typed event buses, strict TypeScript schemas, and zero hacky workarounds designed for massive concurrency.',
      icon: '📐',
      badge: 'TYPE_SAFE_AAA',
    },
    {
      title: 'Self-Serve Recovery',
      subtitle: 'Never lose a purchased license.',
      description:
        'Lost your receipt or device? Query your email anytime on our self-serve support portal for immediate token reissuance and repo access.',
      icon: '🛡️',
      badge: 'SELF_RECOVERY',
    },
  ];

  return (
    <section className="py-20 md:py-28 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 border-t border-border/50">
      <div className="text-center max-w-2xl mx-auto mb-16 space-y-3">
        <span className="text-[10px] font-mono uppercase tracking-widest text-primary font-bold px-2.5 py-1 rounded-full bg-primary/10 border border-primary/20">
          The Commerza Quality Standard
        </span>
        <h2 className="text-3xl sm:text-5xl font-black text-foreground tracking-tight">
          Why Commerza.
        </h2>
        <p className="text-xs sm:text-sm text-foreground/70 leading-relaxed">
          Engineered for software architects, technical founders, and product teams who demand uncompromised craftsmanship.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {pillars.map((p, i) => (
          <div key={i} className="cinematic-card rounded-3xl p-6 flex flex-col justify-between space-y-4 group">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-2xl p-2 rounded-xl bg-foreground/5 border border-border/50">
                  {p.icon}
                </span>
                <span className="text-[9px] font-mono text-foreground/40 font-bold">
                  {p.badge}
                </span>
              </div>
              <div>
                <h4 className="text-base font-black text-foreground tracking-tight group-hover:text-primary transition-colors">
                  {p.title}
                </h4>
                <div className="text-[11px] font-mono text-primary font-semibold mt-0.5">
                  {p.subtitle}
                </div>
              </div>
              <p className="text-xs text-foreground/65 leading-relaxed">
                {p.description}
              </p>
            </div>

            <div className="pt-3 border-t border-border/40 text-[10px] font-mono text-foreground/40">
              Verified Production Ready
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
