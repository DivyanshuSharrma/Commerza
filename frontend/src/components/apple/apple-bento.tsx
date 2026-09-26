'use client';

import Link from 'next/link';

export function AppleBento() {
  return (
    <section className="py-16 md:py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 border-t border-border/60">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Bento Card 1: UI & Design Systems */}
        <div className="group rounded-3xl bg-surface-muted/60 border border-border/70 overflow-hidden flex flex-col justify-between hover:shadow-xl transition-all duration-300">
          <div className="p-8 sm:p-10 text-center space-y-2">
            <span className="text-xs font-bold uppercase tracking-wider text-primary">
              Design Systems
            </span>
            <h3 className="text-3xl font-extrabold text-foreground tracking-tight">
              Aurora UI Kit.
            </h3>
            <p className="text-sm text-foreground/70 max-w-sm mx-auto">
              Future-forward digital experiences with accessible typography and fluid responsive layouts.
            </p>
            <div className="pt-2">
              <Link
                href="/store"
                className="text-xs font-semibold text-primary hover:underline inline-flex items-center gap-1"
              >
                <span>Browse Design Goods</span>
                <span>&gt;</span>
              </Link>
            </div>
          </div>

          <div className="relative px-6 pb-6 overflow-hidden">
            <div className="rounded-2xl overflow-hidden border border-border/80 shadow-md">
              <img
                src="/images/ui-design-system.jpg"
                alt="Aurora UI Design System"
                className="w-full h-auto object-cover group-hover:scale-105 transition-transform duration-500 max-h-[340px]"
              />
            </div>
          </div>
        </div>

        {/* Bento Card 2: Code Engines & Boilerplates */}
        <div className="group rounded-3xl bg-surface-muted/60 border border-border/70 overflow-hidden flex flex-col justify-between hover:shadow-xl transition-all duration-300">
          <div className="p-8 sm:p-10 text-center space-y-2">
            <span className="text-xs font-bold uppercase tracking-wider text-primary">
              Core Architectures
            </span>
            <h3 className="text-3xl font-extrabold text-foreground tracking-tight">
              Microservices Engine.
            </h3>
            <p className="text-sm text-foreground/70 max-w-sm mx-auto">
              Distributed architectures with strict typed boundaries, Prisma ORM, and token-governed vaults.
            </p>
            <div className="pt-2">
              <Link
                href="/store"
                className="text-xs font-semibold text-primary hover:underline inline-flex items-center gap-1"
              >
                <span>Browse Code Engines</span>
                <span>&gt;</span>
              </Link>
            </div>
          </div>

          <div className="relative px-6 pb-6 overflow-hidden">
            <div className="rounded-2xl overflow-hidden border border-border/80 shadow-md">
              <img
                src="/images/code-engineering.jpg"
                alt="Distributed Code Architecture"
                className="w-full h-auto object-cover group-hover:scale-105 transition-transform duration-500 max-h-[340px]"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
