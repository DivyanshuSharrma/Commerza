'use client';

export function AppleMatrix() {
  const pillars = [
    {
      title: 'Lifetime Ownership',
      subtitle: 'Zero recurring subscription locks.',
      description:
        'Pay once, receive the complete production source files, and deploy forever without monthly fees or license locks.',
      icon: '💎',
    },
    {
      title: 'Instant Vault Delivery',
      subtitle: 'Signed cryptographic dispatch.',
      description:
        'Orders emit time-bounded, tamper-proof download tokens instantly to your inbox and confirmation screen.',
      icon: '⚡',
    },
    {
      title: 'Precision Engineering',
      subtitle: 'Strict architecture standards.',
      description:
        'Decoupled domain repositories, typed event buses, and zero hacky workarounds designed for scale.',
      icon: '📐',
    },
    {
      title: 'Self-Serve Recovery',
      subtitle: 'Never lose a purchased license.',
      description:
        'Lost your receipt or device? Query your email anytime on our support portal for instant re-dispatch.',
      icon: '🛡️',
    },
  ];

  return (
    <section className="py-20 md:py-28 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 border-t border-border/60">
      <div className="text-center max-w-2xl mx-auto mb-16 space-y-2">
        <span className="text-xs font-bold uppercase tracking-wider text-primary">
          The Commerza Standard
        </span>
        <h2 className="text-3xl sm:text-4xl font-extrabold text-foreground tracking-tight">
          Why Commerza.
        </h2>
        <p className="text-sm text-foreground/70">
          Built for software architects and product teams who value craftsmanship and true ownership.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
        {pillars.map((p, i) => (
          <div key={i} className="space-y-3 p-6 rounded-2xl bg-card border border-border/70 shadow-xs">
            <div className="text-2xl">{p.icon}</div>
            <h4 className="text-lg font-bold text-foreground tracking-tight">{p.title}</h4>
            <div className="text-xs font-semibold text-primary">{p.subtitle}</div>
            <p className="text-xs text-foreground/70 leading-relaxed">{p.description}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
