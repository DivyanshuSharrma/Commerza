'use client';

import { useState } from 'react';
import { BrandData } from '@/features/brand/brand-context.resolver';

interface HireSectionProps {
  brand: BrandData;
}

export function HireSection({ brand }: HireSectionProps) {
  const [copied, setCopied] = useState(false);
  const theme = brand.themeSettings;
  const email = theme?.hireEmail || 'studio@commerza.com';

  const copyEmail = () => {
    navigator.clipboard.writeText(email);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <section className="py-20 md:py-24 border-t border-border/60 bg-gradient-to-b from-card to-surface-muted/60">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-primary/20 bg-primary/10 text-primary text-[11px] font-extrabold uppercase tracking-widest">
          <span>●</span>
          <span>Bespoke Engineering & Advisory</span>
        </div>

        <h2 className="text-3xl sm:text-4xl font-black text-foreground tracking-tight">
          {theme?.hireTitle || 'Commission Bespoke Architecture or Advisory'}
        </h2>

        <p className="text-xs sm:text-sm text-foreground/70 max-w-xl mx-auto leading-relaxed">
          {theme?.hireSubtitle ||
            'Need custom adaptations, architectural reviews, or proprietary system designs? Let’s connect directly.'}
        </p>

        <div className="pt-4 flex flex-wrap items-center justify-center gap-4">
          <a
            href={`mailto:${email}`}
            className="px-6 py-3 rounded-xl bg-primary text-white font-bold text-xs sm:text-sm shadow-md shadow-primary/20 hover:bg-primary/90 transition-all cursor-pointer"
          >
            Send Inquiry ({email})
          </a>
          <button
            onClick={copyEmail}
            className="px-5 py-3 rounded-xl border border-border bg-card hover:bg-surface-muted text-foreground text-xs sm:text-sm font-semibold transition-colors cursor-pointer"
          >
            {copied ? '✓ Email Copied!' : 'Copy Email Address'}
          </button>
        </div>

        {/* Social Links from Brand Settings */}
        {theme?.socialLinks && (
          <div className="pt-6 flex items-center justify-center gap-6 text-xs text-foreground/60">
            {theme.socialLinks.github && (
              <a
                href={theme.socialLinks.github}
                target="_blank"
                rel="noreferrer"
                className="hover:text-foreground transition-colors"
              >
                GitHub ↗
              </a>
            )}
            {theme.socialLinks.twitter && (
              <a
                href={theme.socialLinks.twitter}
                target="_blank"
                rel="noreferrer"
                className="hover:text-foreground transition-colors"
              >
                Twitter / X ↗
              </a>
            )}
            {theme.socialLinks.email && (
              <a
                href={`mailto:${theme.socialLinks.email}`}
                className="hover:text-foreground transition-colors"
              >
                Direct Contact ↗
              </a>
            )}
          </div>
        )}
      </div>
    </section>
  );
}
