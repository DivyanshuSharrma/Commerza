'use client';

import Link from 'next/link';
import { BrandData } from '@/features/brand/brand-context.resolver';

interface AppleHeroProps {
  brand: BrandData;
}

export function AppleHero({ brand }: AppleHeroProps) {
  const theme = brand.themeSettings;

  return (
    <section className="relative overflow-hidden pt-14 pb-20 md:pt-24 md:pb-32 text-center studio-mesh">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        {/* Eyebrow Studio Pill */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-card/80 border border-border/80 shadow-xs backdrop-blur-md">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-[10px] sm:text-xs font-mono font-bold tracking-wide uppercase text-foreground/80">
            {theme?.heroBadge || '✦ COMMERZA DIGITAL ATELIER / v2.4'}
          </span>
        </div>

        {/* Sculptural Studio Headline */}
        <h1 className="text-5xl sm:text-6xl md:text-8xl font-black tracking-tight text-foreground leading-[1.02] max-w-4xl mx-auto">
          {theme?.heroTitle || 'Architecting Next-Gen Commerce'}
        </h1>

        {/* Subtitle */}
        <p className="text-base sm:text-xl text-foreground/70 font-normal max-w-2xl mx-auto leading-relaxed">
          {theme?.heroSubtitle ||
            'Production-ready SaaS boilerplates, curated design systems, and developer kits crafted with obsessive precision.'}
        </p>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
          <Link
            href="/store"
            className="w-full sm:w-auto px-8 py-3.5 rounded-full bg-foreground text-background font-bold text-sm transition-all hover:opacity-90 shadow-md hover:scale-[1.02] cursor-pointer"
          >
            Explore Catalog &rarr;
          </Link>
          <Link
            href="/categories"
            className="w-full sm:w-auto px-7 py-3.5 rounded-full bg-card/60 hover:bg-card border border-border/80 text-foreground font-semibold text-sm transition-all hover:scale-[1.02] cursor-pointer backdrop-blur-md"
          >
            View Collections
          </Link>
        </div>

        {/* Architectural Live Metrics Ticker */}
        <div className="pt-8 flex flex-wrap items-center justify-center gap-6 sm:gap-10 text-xs font-mono text-foreground/50 border-t border-border/40 max-w-2xl mx-auto">
          <div className="flex items-center gap-2">
            <span className="text-emerald-500 font-bold">●</span>
            <span>Sub-millisecond Edge Delivery</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-primary font-bold">●</span>
            <span>100% Strict TypeScript</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-amber-500 font-bold">●</span>
            <span>Commercial MIT Single-Seat</span>
          </div>
        </div>
      </div>

      {/* Cinematic Showcase Image */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 mt-14 md:mt-20">
        <div className="relative rounded-3xl overflow-hidden border border-border/70 shadow-2xl bg-card group">
          <img
            src="/images/hero-keynote.jpg"
            alt="Commerza Flagship Architecture"
            className="w-full h-auto object-cover max-h-[640px] transition-transform duration-700 group-hover:scale-[1.01]"
          />
          <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-background via-background/40 to-transparent pointer-events-none" />
        </div>
      </div>
    </section>
  );
}
