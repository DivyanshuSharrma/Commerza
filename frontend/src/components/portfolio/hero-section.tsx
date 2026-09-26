'use client';

import Link from 'next/link';
import { BrandData } from '@/features/brand/brand-context.resolver';

interface HeroSectionProps {
  brand: BrandData;
  featuredProduct?: any;
  onOpenRecovery: () => void;
}

export function HeroSection({ brand, featuredProduct, onOpenRecovery }: HeroSectionProps) {
  const theme = brand.themeSettings;

  return (
    <section className="relative overflow-hidden pt-12 pb-20 md:py-24 border-b border-border/60">
      {/* Background Ambient Orbs */}
      <div className="absolute top-10 left-1/2 -translate-x-1/2 w-[700px] h-[350px] bg-gradient-to-tr from-primary/10 via-secondary/10 to-transparent blur-3xl pointer-events-none -z-10" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          {/* Left Column: Creative Manifesto */}
          <div className="lg:col-span-7 space-y-6 text-left animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Live Indicator Pill */}
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-border/70 bg-card/70 backdrop-blur-md shadow-xs text-xs font-semibold text-foreground/80">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="tracking-wide uppercase text-[11px] font-bold text-primary">
                {theme?.heroBadge || '✦ CREATIVE ENGINEER & ARTIFACTS'}
              </span>
            </div>

            {/* Headline */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight text-foreground leading-[1.08]">
              {theme?.heroTitle || 'Architecting Next-Gen Digital Goods & Codecraft'}
            </h1>

            {/* Subtitle */}
            <p className="text-base sm:text-lg text-foreground/75 font-normal leading-relaxed max-w-2xl">
              {theme?.heroSubtitle ||
                'Production-ready SaaS boilerplates, curated design systems, and developer kits crafted with obsessive precision.'}
            </p>

            {/* CTA Group */}
            <div className="flex flex-wrap items-center gap-3 pt-2">
              <a
                href="#goods"
                className="px-6 py-3.5 rounded-xl bg-primary text-white font-bold text-sm shadow-lg shadow-primary/25 hover:shadow-primary/40 hover:-translate-y-0.5 active:translate-y-0 transition-all cursor-pointer inline-flex items-center gap-2"
              >
                <span>Browse Goods</span>
                <span>↓</span>
              </a>
              <a
                href="#philosophy"
                className="px-5 py-3.5 rounded-xl border border-border/80 bg-card/60 hover:bg-card text-foreground font-semibold text-sm transition-all cursor-pointer backdrop-blur-sm"
              >
                The Maker's Craft
              </a>
              <button
                onClick={onOpenRecovery}
                className="text-xs font-semibold text-foreground/60 hover:text-foreground px-3 py-2 transition-colors cursor-pointer"
              >
                Lost download? <span className="underline decoration-dotted">Find orders</span>
              </button>
            </div>

            {/* Quick Metrics Bar */}
            <div className="pt-6 border-t border-border/60 flex flex-wrap items-center gap-8 text-xs text-foreground/70">
              <div className="flex items-center gap-2">
                <span className="text-primary font-bold">⚡</span>
                <span>Instant automated license dispatch</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-emerald-500 font-bold">✓</span>
                <span>No recurring subscription locks</span>
              </div>
            </div>
          </div>

          {/* Right Column: Holographic Flagship Artifact Preview */}
          <div className="lg:col-span-5">
            {featuredProduct ? (
              <div className="relative group rounded-3xl p-1 bg-gradient-to-b from-primary/30 via-border/50 to-border/20 shadow-2xl hover:shadow-primary/10 transition-all duration-500">
                <div className="bg-card rounded-[22px] overflow-hidden border border-border/60 p-6 flex flex-col">
                  {/* Badge & Delivery */}
                  <div className="flex items-center justify-between gap-2 mb-4">
                    <span className="text-[11px] font-extrabold uppercase tracking-wider px-2.5 py-1 rounded-md bg-primary/10 text-primary border border-primary/20">
                      Featured Artifact
                    </span>
                    <span className="text-[11px] font-medium text-foreground/60 bg-surface-muted px-2.5 py-1 rounded-md">
                      {featuredProduct.deliveryType || 'Instant Digital Delivery'}
                    </span>
                  </div>

                  {/* Visual Preview */}
                  <div className="relative aspect-video rounded-xl overflow-hidden bg-surface-muted mb-4 border border-border/60">
                    {featuredProduct.media?.[0]?.url ? (
                      <img
                        src={featuredProduct.media[0].url}
                        alt={featuredProduct.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center text-foreground/30 p-4 text-center">
                        <span className="text-3xl mb-1">📦</span>
                        <span className="text-xs font-semibold">Flagship Digital Goods</span>
                      </div>
                    )}
                  </div>

                  {/* Title & Description */}
                  <h3 className="text-lg font-bold text-foreground mb-1.5 line-clamp-1">
                    {featuredProduct.title}
                  </h3>
                  <p className="text-xs text-foreground/65 line-clamp-2 mb-5 leading-relaxed">
                    {featuredProduct.description}
                  </p>

                  {/* Price & Checkout Action */}
                  <div className="mt-auto pt-4 border-t border-border/60 flex items-center justify-between">
                    <div>
                      <div className="text-[10px] uppercase font-bold text-foreground/50 tracking-wider">
                        One-Time Price
                      </div>
                      <div className="text-2xl font-black text-foreground flex items-baseline gap-2">
                        ${featuredProduct.salePrice || featuredProduct.price}
                        {featuredProduct.salePrice && (
                          <span className="text-sm line-through font-normal text-foreground/40">
                            ${featuredProduct.price}
                          </span>
                        )}
                      </div>
                    </div>
                    <Link
                      href={`/checkout?productId=${featuredProduct.id}`}
                      className="px-5 py-2.5 rounded-xl bg-primary text-white font-bold text-xs shadow-md shadow-primary/25 hover:bg-primary/90 transition-all cursor-pointer"
                    >
                      Instant Purchase →
                    </Link>
                  </div>
                </div>
              </div>
            ) : (
              <div className="rounded-3xl p-8 bg-card border border-border/60 shadow-xl flex flex-col items-center justify-center text-center py-16">
                <span className="text-4xl mb-3">🎨</span>
                <h3 className="text-lg font-bold text-foreground mb-2">Curated Digital Atelier</h3>
                <p className="text-xs text-foreground/70 max-w-xs mb-4">
                  Browse developer templates, code engines, and design systems in our digital catalog below.
                </p>
                <a
                  href="#goods"
                  className="px-4 py-2 rounded-xl bg-primary text-white text-xs font-bold"
                >
                  View Catalog
                </a>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
