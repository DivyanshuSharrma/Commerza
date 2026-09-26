'use client';

import Link from 'next/link';
import { BrandData } from '@/features/brand/brand-context.resolver';

interface AppleHeroProps {
  brand: BrandData;
}

export function AppleHero({ brand }: AppleHeroProps) {
  const theme = brand.themeSettings;

  return (
    <section className="relative overflow-hidden pt-12 pb-20 md:pt-20 md:pb-32 text-center">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        {/* Eyebrow */}
        <div className="text-xs sm:text-sm font-semibold tracking-wide text-primary uppercase">
          {theme?.heroBadge || '✦ COMMERZA ENGINEERING'}
        </div>

        {/* Apple Style Headline */}
        <h1 className="text-5xl sm:text-6xl md:text-7xl font-extrabold tracking-tight text-foreground leading-[1.05]">
          {theme?.heroTitle || 'The Digital Standard.'}
        </h1>

        {/* Subtitle */}
        <p className="text-lg sm:text-xl text-foreground/75 font-normal max-w-2xl mx-auto leading-relaxed">
          {theme?.heroSubtitle ||
            'Production-ready software architectures, design systems, and developer kits crafted with obsessive precision.'}
        </p>

        {/* Apple CTAs */}
        <div className="flex items-center justify-center gap-4 pt-2">
          <Link
            href="/store"
            className="px-6 py-2.5 rounded-full bg-primary hover:bg-primary/90 text-white font-semibold text-sm transition-all shadow-sm shadow-primary/25 cursor-pointer"
          >
            Explore Store
          </Link>
          <Link
            href="/about"
            className="text-sm font-semibold text-primary hover:underline transition-all inline-flex items-center gap-1"
          >
            <span>Learn more</span>
            <span>&gt;</span>
          </Link>
        </div>
      </div>

      {/* Cinematic Hardware & Software Showcase Image */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 mt-12 md:mt-16">
        <div className="relative rounded-3xl overflow-hidden border border-border/70 shadow-2xl bg-card">
          <img
            src="/images/hero-keynote.jpg"
            alt="Commerza Flagship Architecture"
            className="w-full h-auto object-cover max-h-[620px] transition-transform duration-700 hover:scale-[1.01]"
          />
          <div className="absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-background/80 to-transparent pointer-events-none" />
        </div>
      </div>
    </section>
  );
}
