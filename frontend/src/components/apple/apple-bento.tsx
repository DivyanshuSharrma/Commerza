'use client';

import Link from 'next/link';

export function AppleBento() {
  return (
    <section className="py-20 md:py-28 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 border-t border-border/50">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Bento Card 1: UI & Design Systems */}
        <div className="cinematic-card rounded-3xl overflow-hidden flex flex-col justify-between group">
          <div className="p-8 sm:p-12 text-center space-y-3">
            <span className="text-[10px] font-mono uppercase tracking-widest text-primary font-bold px-2.5 py-1 rounded-full bg-primary/10 border border-primary/20">
              Design Engineering
            </span>
            <h3 className="text-3xl sm:text-4xl font-black text-foreground tracking-tight">
              Aura Studio UI System.
            </h3>
            <p className="text-xs sm:text-sm text-foreground/70 max-w-md mx-auto leading-relaxed">
              Future-forward digital experiences with accessible typography, fluid responsive tokens, and zero-dependency micro-interactions.
            </p>
            <div className="pt-2">
              <Link
                href="/store"
                className="text-xs font-semibold text-primary hover:underline inline-flex items-center gap-1 group-hover:gap-1.5 transition-all"
              >
                <span>Explore Design System Goods</span>
                <span>&rarr;</span>
              </Link>
            </div>
          </div>

          <div className="relative px-6 pb-6 overflow-hidden">
            <div className="rounded-2xl overflow-hidden border border-border/80 shadow-md">
              <img
                src="/images/ui-design-system.jpg"
                alt="Aurora UI Design System"
                className="w-full h-auto object-cover group-hover:scale-105 transition-transform duration-500 max-h-[360px]"
              />
            </div>
          </div>
        </div>

        {/* Bento Card 2: Code Engines & Boilerplates */}
        <div className="cinematic-card rounded-3xl overflow-hidden flex flex-col justify-between group">
          <div className="p-8 sm:p-12 text-center space-y-3">
            <span className="text-[10px] font-mono uppercase tracking-widest text-primary font-bold px-2.5 py-1 rounded-full bg-primary/10 border border-primary/20">
              Core Architectures
            </span>
            <h3 className="text-3xl sm:text-4xl font-black text-foreground tracking-tight">
              Nova Microservices Engine.
            </h3>
            <p className="text-xs sm:text-sm text-foreground/70 max-w-md mx-auto leading-relaxed">
              Enterprise distributed kernel with strict typed boundaries, Prisma ORM, Stripe billing engine, and token-governed security vaults.
            </p>
            <div className="pt-2">
              <Link
                href="/store"
                className="text-xs font-semibold text-primary hover:underline inline-flex items-center gap-1 group-hover:gap-1.5 transition-all"
              >
                <span>Explore Full-Stack Architectures</span>
                <span>&rarr;</span>
              </Link>
            </div>
          </div>

          <div className="relative px-6 pb-6 overflow-hidden">
            <div className="rounded-2xl overflow-hidden border border-border/80 shadow-md">
              <img
                src="/images/code-engineering.jpg"
                alt="Distributed Code Architecture"
                className="w-full h-auto object-cover group-hover:scale-105 transition-transform duration-500 max-h-[360px]"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
