'use client';

import * as React from 'react';
import Link from 'next/link';
import { ProductInspectModal } from './product-inspect-modal';

interface Product {
  id: string;
  title: string;
  slug: string;
  description: string;
  shortDescription?: string;
  price: string | number;
  salePrice?: string | number | null;
  deliveryType?: string;
  features?: string;
  specifications?: string;
  whatsIncluded?: string;
  media: { id?: string; url: string; isPrimary: boolean }[];
  categories: { id: string; name: string; slug: string }[];
}

interface WorksStoreSectionProps {
  products: Product[];
  brandName: string;
}

export function WorksStoreSection({ products, brandName }: WorksStoreSectionProps) {
  const [search, setSearch] = React.useState('');
  const [selectedCategorySlug, setSelectedCategorySlug] = React.useState<string | null>(null);
  const [sortBy, setSortBy] = React.useState<'featured' | 'price-asc' | 'price-desc'>('featured');
  const [inspectedProduct, setInspectedProduct] = React.useState<Product | null>(null);

  // Extract unique categories dynamically
  const categories = React.useMemo(() => {
    const map = new Map<string, { id: string; name: string; slug: string; count: number }>();
    products.forEach((p) => {
      (p.categories || []).forEach((c) => {
        const existing = map.get(c.slug);
        if (existing) {
          existing.count += 1;
        } else {
          map.set(c.slug, { ...c, count: 1 });
        }
      });
    });
    return Array.from(map.values());
  }, [products]);

  // Filter & Sort
  const filteredProducts = React.useMemo(() => {
    let list = products.filter((p) => {
      const q = search.toLowerCase();
      const matchesSearch =
        p.title.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q) ||
        (p.shortDescription && p.shortDescription.toLowerCase().includes(q));

      const matchesCategory =
        !selectedCategorySlug ||
        (p.categories || []).some((c) => c.slug === selectedCategorySlug);

      return matchesSearch && matchesCategory;
    });

    if (sortBy === 'price-asc') {
      list = [...list].sort((a, b) => Number(a.salePrice || a.price) - Number(b.salePrice || b.price));
    } else if (sortBy === 'price-desc') {
      list = [...list].sort((a, b) => Number(b.salePrice || b.price) - Number(a.salePrice || a.price));
    }

    return list;
  }, [products, search, selectedCategorySlug, sortBy]);

  return (
    <section id="goods" className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
      {/* Dynamic Studio Filter Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 rounded-2xl bg-card/60 border border-border/70 backdrop-blur-xl">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search codebases, design kits, AI runtimes..."
            className="w-full pl-9 pr-8 py-2 bg-background/80 border border-border/80 rounded-xl text-xs text-foreground placeholder:text-foreground/40 focus:outline-none focus:ring-2 focus:ring-primary/40 transition-all"
          />
          <span className="absolute left-3 top-2.5 text-foreground/40 text-xs">🔍</span>
          {search && (
            <button
              onClick={() => setSearch('')}
              className="absolute right-3 top-2.5 text-foreground/40 hover:text-foreground text-xs cursor-pointer"
            >
              ✕
            </button>
          )}
        </div>

        {/* Live Metrics & Sort */}
        <div className="flex items-center gap-3 justify-between md:justify-end">
          <span className="text-[11px] font-mono text-foreground/50 hidden sm:inline">
            Showing <strong className="text-foreground font-bold">{filteredProducts.length}</strong> of {products.length} releases
          </span>
          <div className="flex items-center gap-1.5 text-xs text-foreground/70">
            <span className="text-[10px] font-mono uppercase text-foreground/40">Sort:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="bg-background border border-border/80 rounded-lg px-2.5 py-1.5 text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 cursor-pointer"
            >
              <option value="featured">Featured First</option>
              <option value="price-asc">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
            </select>
          </div>
        </div>
      </div>

      {/* Category Pills Filter */}
      {categories.length > 0 && (
        <div className="flex items-center gap-2 overflow-x-auto pb-2 no-scrollbar">
          <button
            onClick={() => setSelectedCategorySlug(null)}
            className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer select-none whitespace-nowrap flex items-center gap-1.5 ${
              selectedCategorySlug === null
                ? 'bg-foreground text-background shadow-xs font-bold'
                : 'bg-card border border-border/70 text-foreground/70 hover:bg-surface-muted hover:text-foreground'
            }`}
          >
            <span>All Works</span>
            <span className="text-[10px] opacity-60">({products.length})</span>
          </button>
          {categories.map((c) => (
            <button
              key={c.id}
              onClick={() => setSelectedCategorySlug(c.slug)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer select-none whitespace-nowrap flex items-center gap-1.5 ${
                selectedCategorySlug === c.slug
                  ? 'bg-foreground text-background shadow-xs font-bold'
                  : 'bg-card border border-border/70 text-foreground/70 hover:bg-surface-muted hover:text-foreground'
              }`}
            >
              <span>{c.name}</span>
              <span className="text-[10px] opacity-60">({c.count})</span>
            </button>
          ))}
        </div>
      )}

      {/* Products Grid */}
      {filteredProducts.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredProducts.map((p) => {
            const primaryMedia = (p.media || []).find((m) => m.isPrimary) || (p.media || [])[0] || null;
            const categoryName = p.categories?.[0]?.name || 'Production Suite';
            const priceNum = Number(p.price);
            const salePriceNum = p.salePrice ? Number(p.salePrice) : null;
            const savings = salePriceNum ? Math.round(((priceNum - salePriceNum) / priceNum) * 100) : 0;

            return (
              <div
                key={p.id}
                className="cinematic-card rounded-3xl p-6 flex flex-col justify-between group relative overflow-hidden"
              >
                {/* Visual Preview / Schematic Box */}
                <div className="relative aspect-[16/10] w-full rounded-2xl bg-surface-muted/90 border border-border/70 overflow-hidden mb-5 flex flex-col justify-between p-4 group-hover:border-primary/40 transition-colors">
                  {/* Top Bar inside preview */}
                  <div className="flex items-center justify-between z-10">
                    <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded-md bg-card/90 backdrop-blur-md text-foreground/80 border border-border/70 font-semibold shadow-xs">
                      {categoryName}
                    </span>
                    {savings > 0 && (
                      <span className="text-[10px] font-mono font-bold bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 px-2 py-0.5 rounded-md">
                        SAVE {savings}%
                      </span>
                    )}
                  </div>

                  {/* Visual Background: Image or Code Schematic */}
                  {primaryMedia?.url && !primaryMedia.url.includes('placeholder') ? (
                    <img
                      src={primaryMedia.url}
                      alt={p.title}
                      className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  ) : (
                    <div className="absolute inset-0 p-4 font-mono text-[10px] text-foreground/35 select-none leading-relaxed overflow-hidden flex flex-col justify-center">
                      <div className="text-primary/70 font-bold mb-1">// ARCHITECTURE_SPEC: {p.slug}</div>
                      <div>export interface Blueprint {'{'}</div>
                      <div className="pl-3 text-emerald-500/60">latency: &#39;&lt; 15ms&#39;;</div>
                      <div className="pl-3 text-cyan-500/60">runtime: &#39;Edge / Node.js 20+&#39;;</div>
                      <div className="pl-3 text-indigo-500/60">audited: true;</div>
                      <div className="pl-3">verified: Date.now();</div>
                      <div>{'}'}</div>
                    </div>
                  )}

                  {/* Bottom Bar inside preview */}
                  <div className="flex items-center justify-between z-10 mt-auto pt-2">
                    <span className="text-[9px] font-mono text-foreground/50 bg-background/80 px-2 py-0.5 rounded backdrop-blur-xs">
                      ⚡ Instant Token Release
                    </span>
                    <span className="text-[10px] font-mono text-foreground/60">
                      v2.4
                    </span>
                  </div>
                </div>

                {/* Content Section */}
                <div className="space-y-3 flex-1 flex flex-col justify-between">
                  <div className="space-y-1.5">
                    <h3 className="text-lg font-black tracking-tight text-foreground group-hover:text-primary transition-colors line-clamp-1">
                      {p.title}
                    </h3>
                    <p className="text-xs text-foreground/65 line-clamp-2 leading-relaxed">
                      {p.shortDescription || p.description}
                    </p>
                  </div>

                  {/* Feature Pills */}
                  <div className="flex flex-wrap gap-1.5 pt-2">
                    <span className="text-[10px] font-mono bg-foreground/5 text-foreground/75 px-2 py-0.5 rounded border border-border/40">
                      TypeScript 5+
                    </span>
                    <span className="text-[10px] font-mono bg-foreground/5 text-foreground/75 px-2 py-0.5 rounded border border-border/40">
                      Production Ready
                    </span>
                    <span className="text-[10px] font-mono bg-foreground/5 text-foreground/75 px-2 py-0.5 rounded border border-border/40">
                      MIT License
                    </span>
                  </div>

                  {/* Price & Action Suite */}
                  <div className="pt-4 border-t border-border/50 flex items-center justify-between gap-3 mt-4">
                    <div>
                      <div className="text-[9px] font-mono text-foreground/40 uppercase">License</div>
                      <div className="text-lg font-black text-foreground flex items-baseline gap-1.5">
                        ${salePriceNum || priceNum}
                        {salePriceNum && (
                          <span className="text-xs font-normal text-foreground/40 line-through">
                            ${priceNum}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setInspectedProduct(p)}
                        className="px-3 py-1.5 rounded-xl border border-border/80 hover:bg-surface-muted text-foreground text-xs font-semibold transition-all cursor-pointer"
                        title="View Architecture Specs"
                      >
                        Inspect
                      </button>
                      <Link
                        href={`/checkout?productId=${p.id}`}
                        className="px-4 py-1.5 rounded-xl bg-primary hover:bg-primary/90 text-white text-xs font-bold shadow-sm shadow-primary/20 transition-all hover:scale-[1.02] cursor-pointer"
                      >
                        Acquire &rarr;
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-20 bg-card rounded-3xl border border-dashed border-border/80 space-y-3">
          <span className="text-4xl block">🔍</span>
          <h3 className="text-base font-bold text-foreground">No matching artifacts found</h3>
          <p className="text-xs text-foreground/60 max-w-sm mx-auto">
            Try adjusting your search keywords or reset category filters.
          </p>
          <button
            onClick={() => {
              setSearch('');
              setSelectedCategorySlug(null);
            }}
            className="px-4 py-2 bg-primary text-white rounded-xl text-xs font-semibold cursor-pointer"
          >
            Reset All Filters
          </button>
        </div>
      )}

      {/* Quick Inspection Modal */}
      <ProductInspectModal
        product={inspectedProduct}
        onClose={() => setInspectedProduct(null)}
      />
    </section>
  );
}
