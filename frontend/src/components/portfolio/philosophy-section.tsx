'use client';

import { BrandData } from '@/features/brand/brand-context.resolver';

interface PhilosophySectionProps {
  brand: BrandData;
}

export function PhilosophySection({ brand }: PhilosophySectionProps) {
  const theme = brand.themeSettings;

  const pillars = [
    {
      icon: '💎',
      title: 'Perpetual Single Ownership',
      description:
        'Zero recurring subscriptions or locked licenses. You receive the complete artifact with full ownership to customize, deploy, and scale.',
    },
    {
      icon: '⚡',
      title: 'Production-Hardened Engineering',
      description:
        'Battle-tested architecture patterns, typed contracts, and rigorous lint standards designed to plug directly into enterprise tech stacks.',
    },
    {
      icon: '🛡️',
      title: 'Instant Automated Vault Fulfillment',
      description:
        'Zero manual waiting. Orders automatically emit signed download tokens with continuous self-serve order retrieval anytime.',
    },
  ];

  return (
    <section id="philosophy" className="py-20 md:py-28 border-t border-border/60 bg-surface-muted/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          {/* Creator Profile Box */}
          <div className="lg:col-span-5 space-y-6">
            <div className="text-[11px] font-extrabold uppercase tracking-widest text-primary flex items-center gap-2">
              <span>✦</span>
              <span>The Atelier Manifesto</span>
            </div>

            <h2 className="text-3xl sm:text-4xl font-black text-foreground tracking-tight leading-tight">
              Crafted with Obsession. Built for Builders.
            </h2>

            <div className="bg-card p-6 sm:p-8 rounded-2xl border border-border/70 shadow-sm space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-primary/10 border border-primary/20 text-primary flex items-center justify-center font-black text-lg">
                  {brand.name.substring(0, 1).toUpperCase()}
                </div>
                <div>
                  <h4 className="font-bold text-sm text-foreground">{brand.name}</h4>
                  <p className="text-xs text-foreground/60">{theme?.creatorRole || 'Principal Architect'}</p>
                </div>
              </div>

              <p className="text-xs sm:text-sm text-foreground/75 leading-relaxed">
                {theme?.creatorBio ||
                  'We build bespoke software foundations, developer tooling, and aesthetic UI kits for builders who refuse to compromise on quality and speed.'}
              </p>

              <div className="pt-3 border-t border-border/60 flex items-center justify-between text-[11px] text-foreground/60">
                <span>📍 {theme?.creatorLocation || 'Global / Remote'}</span>
                <span className="text-emerald-500 font-semibold">● Open to Collaborations</span>
              </div>
            </div>
          </div>

          {/* Pillars Bento */}
          <div className="lg:col-span-7 space-y-4">
            {pillars.map((pillar, i) => (
              <div
                key={i}
                className="bg-card p-6 rounded-2xl border border-border/70 hover:border-primary/40 transition-all duration-200 shadow-xs flex items-start gap-4"
              >
                <div className="w-10 h-10 rounded-xl bg-surface-muted flex items-center justify-center text-xl shrink-0">
                  {pillar.icon}
                </div>
                <div className="space-y-1">
                  <h4 className="text-base font-bold text-foreground">{pillar.title}</h4>
                  <p className="text-xs sm:text-sm text-foreground/65 leading-relaxed">
                    {pillar.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
