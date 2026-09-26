'use client';

import { BrandData } from '@/features/brand/brand-context.resolver';

interface TechStackBentoProps {
  brand: BrandData;
}

export function TechStackBento({ brand }: TechStackBentoProps) {
  const skills = brand.themeSettings?.skills || [
    'TypeScript 5.7',
    'Next.js 16 (App Router)',
    'NestJS 11',
    'Tailwind CSS v4',
    'Prisma ORM',
    'Modular Repositories',
    'Stripe & Razorpay',
    'Secure Token Vaults',
  ];

  return (
    <section className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 border-t border-border/60">
      <div className="text-center max-w-2xl mx-auto mb-12 space-y-2">
        <div className="text-[11px] font-extrabold uppercase tracking-widest text-primary">
          ✦ Architectural Foundations
        </div>
        <h2 className="text-3xl font-black text-foreground tracking-tight">
          Engineered With Modern Industrial Standards
        </h2>
        <p className="text-xs sm:text-sm text-foreground/70">
          Every codebase is crafted to run blazingly fast in production with zero legacy technical debt.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Core Stack Pill Cloud */}
        <div className="md:col-span-2 bg-card p-6 sm:p-8 rounded-2xl border border-border/70 shadow-xs flex flex-col justify-between">
          <div>
            <h3 className="text-base font-bold text-foreground mb-1">Production Tech Ecosystem</h3>
            <p className="text-xs text-foreground/60 mb-6">
              Core technologies powering our digital boilerplates, software engines, and frontend frameworks.
            </p>
            <div className="flex flex-wrap gap-2.5">
              {skills.map((skill, i) => (
                <span
                  key={i}
                  className="px-3.5 py-1.5 rounded-xl bg-surface-muted border border-border text-foreground font-semibold text-xs hover:border-primary/50 hover:bg-primary/5 transition-all select-none shadow-2xs"
                >
                  {skill}
                </span>
              ))}
            </div>
          </div>

          <div className="mt-8 pt-4 border-t border-border/60 text-[11px] text-foreground/60 flex items-center justify-between">
            <span>Clean Architecture Principles</span>
            <span className="font-semibold text-primary">Zero Bloat Guarantee</span>
          </div>
        </div>

        {/* Security & Vault Spec */}
        <div className="bg-card p-6 sm:p-8 rounded-2xl border border-border/70 shadow-xs flex flex-col justify-between">
          <div className="space-y-3">
            <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center text-xl">
              🛡️
            </div>
            <h3 className="text-base font-bold text-foreground">Secure Token Vault</h3>
            <p className="text-xs text-foreground/65 leading-relaxed">
              Downloads are signed with cryptographic random byte tokens, quota enforcement, and time-expiry windows to prevent link leeching.
            </p>
          </div>

          <div className="mt-6 pt-4 border-t border-border/60 flex items-center gap-2 text-xs font-bold text-emerald-600 dark:text-emerald-400">
            <span>●</span>
            <span>Cryptographically Verified</span>
          </div>
        </div>
      </div>
    </section>
  );
}
