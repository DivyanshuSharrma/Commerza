'use client';

import * as React from 'react';
import Link from 'next/link';

interface Product {
  id: string;
  title: string;
  slug: string;
  description: string;
  price: string;
  salePrice?: string | null;
  deliveryType?: string;
  media: { id: string; url: string; isPrimary: boolean }[];
  categories: { id: string; name: string; slug: string }[];
}

interface WorksStoreSectionProps {
  products: Product[];
  brandName: string;
}

export function WorksStoreSection({ products, brandName }: WorksStoreSectionProps) {
  const [search, setSearch] = React.useState('');
  const [selectedCategorySlug, setSelectedCategorySlug] = React.useState<string | null>(null);

  // Extract unique categories dynamically from products
  const categories = React.useMemo(() => {
    const map = new Map<string, { id: string; name: string; slug: string }>();
    products.forEach((p) => {
      (p.categories || []).forEach((c) => {
        map.set(c.slug, c);
      });
    });
    return Array.from(map.values());
  }, [products]);

  // Filter products based on search and selected category
  const filteredProducts = React.useMemo(() => {
    return products.filter((p) => {
      const q = search.toLowerCase();
      const matchesSearch =
        p.title.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q);

      const matchesCategory =
        !selectedCategorySlug ||
        (p.categories || []).some((c) => c.slug === selectedCategorySlug);

      return matchesSearch && matchesCategory;
    });
  }, [products, search, selectedCategorySlug]);

  return (
    <section id="goods" className="py-20 md:py-28 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Section Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
        <div className="space-y-2">
          <div className="text-[11px] font-extrabold uppercase tracking-widest text-primary flex items-center gap-2">
            <span>✦</span>
            <span>Digital Goods & Masterpieces</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-black text-foreground tracking-tight">
            Curated Code & Design Artifacts
          </h2>
          <p className="text-xs sm:text-sm text-foreground/70 max-w-xl">
            Each artifact is an independent, single-license codebase or design suite crafted to save you hundreds of engineering hours.
          </p>
        </div>

        {/* Search Input */}
        <div className="relative w-full md:w-72">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search artifacts..."
            className="w-full pl-9 pr-4 py-2.5 bg-card border border-border/80 rounded-xl text-xs text-foreground placeholder:text-foreground/40 focus:outline-none focus:ring-2 focus:ring-primary/40 transition-all shadow-xs"
          />
          <span className="absolute left-3 top-2.5 text-foreground/40 text-xs">🔍</span>
          {search && (
            <button
              onClick={() => setSearch('')}
              className="absolute right-3 top-2.5 text-foreground/40 hover:text-foreground text-xs"
            >
              ✕
            </button>
          )}
        </div>
      </div>

      {/* Category Pills Filter */}
      {categories.length > 0 && (
        <div className="flex items-center gap-2 overflow-x-auto pb-4 mb-8 no-scrollbar">
          <button
            onClick={() => setSelectedCategorySlug(null)}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer select-none whitespace-nowrap ${
              selectedCategorySlug === null
                ? 'bg-primary text-white shadow-md shadow-primary/20'
                : 'bg-card border border-border/70 text-foreground/70 hover:bg-surface-muted hover:text-foreground'
            }`}
          >
            All Works ({products.length})
          </button>
          {categories.map((c) => (
            <button
              key={c.id}
              onClick={() => setSelectedCategorySlug(c.slug)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer select-none whitespace-nowrap ${
                selectedCategorySlug === c.slug
                  ? 'bg-primary text-white shadow-md shadow-primary/20'
                  : 'bg-card border border-border/70 text-foreground/70 hover:bg-surface-muted hover:text-foreground'
              }`}
            >
              {c.name}
            </button>
          ))}
        </div>
      )}

      {/* Products Grid */}
      {filteredProducts.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredProducts.map((p) => {
            const primaryMedia = (p.media || []).find((m) => m.isPrimary) || (p.media || [])[0] || null;
            return (
              <div
                key={p.id}
                className="group flex flex-col bg-card rounded-2xl border border-border/70 overflow-hidden shadow-sm hover:shadow-xl hover:shadow-primary/5 transition-all duration-300 hover:-translate-y-1"
              >
                {/* Media Image Container */}
                <Link
                  href={`/products/${p.slug}`}
                  className="relative aspect-video w-full overflow-hidden bg-surface-muted block"
                >
                  {primaryMedia ? (
                    <img
                      src={primaryMedia.url}
                      alt={p.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center text-foreground/30 p-4">
                      <span className="text-3xl mb-1">💻</span>
                      <span className="text-[11px] font-semibold">Digital Good Preview</span>
                    </div>
                  )}

                  {/* Badges Overlay */}
                  <div className="absolute top-3 left-3 flex flex-wrap gap-1.5">
                    {(p.categories || []).slice(0, 2).map((cat) => (
                      <span
                        key={cat.id}
                        className="bg-card/90 backdrop-blur-md text-foreground text-[10px] font-bold px-2.5 py-1 rounded-md border border-border/70 shadow-xs"
                      >
                        {cat.name}
                      </span>
                    ))}
                  </div>

                  {p.salePrice && (
                    <span className="absolute top-3 right-3 bg-red-600 text-white text-[10px] font-black px-2 py-0.5 rounded-md shadow-sm">
                      SALE
                    </span>
                  )}
                </Link>

                {/* Card Details */}
                <div className="p-6 flex-1 flex flex-col">
                  <div className="text-[10px] font-bold uppercase tracking-wider text-primary mb-1">
                    {p.deliveryType || 'Instant Digital Delivery'}
                  </div>

                  <Link href={`/products/${p.slug}`}>
                    <h3 className="text-base font-bold text-foreground group-hover:text-primary transition-colors line-clamp-1 mb-2">
                      {p.title}
                    </h3>
                  </Link>

                  <p className="text-xs text-foreground/65 line-clamp-3 leading-relaxed mb-6 flex-1">
                    {p.description}
                  </p>

                  {/* Price & Checkout Footer */}
                  <div className="mt-auto pt-4 border-t border-border/60 flex items-center justify-between">
                    <div>
                      <div className="text-xl font-extrabold text-foreground flex items-baseline gap-1.5">
                        ${p.salePrice || p.price}
                        {p.salePrice && (
                          <span className="text-xs font-normal text-foreground/40 line-through">
                            ${p.price}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <Link
                        href={`/products/${p.slug}`}
                        className="px-3 py-1.5 rounded-lg border border-border hover:bg-surface-muted text-foreground text-xs font-semibold transition-colors"
                      >
                        Inspect
                      </Link>
                      <Link
                        href={`/checkout?productId=${p.id}`}
                        className="px-4 py-1.5 rounded-lg bg-primary hover:bg-primary/90 text-white text-xs font-bold shadow-xs transition-colors"
                      >
                        Buy Now
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-20 bg-card rounded-2xl border border-dashed border-border/80">
          <span className="text-4xl block mb-2">🔍</span>
          <h3 className="text-base font-bold text-foreground mb-1">No matching artifacts found</h3>
          <p className="text-xs text-foreground/60 max-w-sm mx-auto mb-4">
            Try adjusting your search query or reset the category filter to explore all available digital releases.
          </p>
          <button
            onClick={() => {
              setSearch('');
              setSelectedCategorySlug(null);
            }}
            className="px-4 py-2 bg-primary text-white rounded-lg text-xs font-semibold cursor-pointer"
          >
            Clear Filters
          </button>
        </div>
      )}
    </section>
  );
}
