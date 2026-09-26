'use client';

import Link from 'next/link';

export function AppleCta() {
  return (
    <section className="py-20 md:py-28 border-t border-border/60 bg-surface-muted/50 text-center">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <h2 className="text-4xl sm:text-5xl font-black text-foreground tracking-tight">
          Elevate your engineering today.
        </h2>
        <p className="text-base sm:text-lg text-foreground/75 leading-relaxed max-w-xl mx-auto">
          Equip your technical team with verified software foundations, design frameworks, and boilerplate engines.
        </p>
        <div className="pt-4 flex items-center justify-center gap-4">
          <Link
            href="/store"
            className="px-7 py-3 rounded-full bg-primary hover:bg-primary/90 text-white font-bold text-sm shadow-md shadow-primary/20 transition-all cursor-pointer"
          >
            Visit The Store
          </Link>
          <Link
            href="/categories"
            className="px-6 py-3 rounded-full border border-border bg-card hover:bg-border/60 text-foreground font-semibold text-sm transition-all cursor-pointer"
          >
            Explore Categories
          </Link>
        </div>
      </div>
    </section>
  );
}
