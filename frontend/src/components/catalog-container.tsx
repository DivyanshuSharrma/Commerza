'use client';

import * as React from 'react';
import { SearchBox } from './search-box';
import { CategoryFilter } from './category-filter';
import { ProductCard } from './product-card';

interface Product {
  id: string;
  title: string;
  slug: string;
  description: string;
  price: string;
  media: { id: string; url: string; isPrimary: boolean }[];
  categories: { id: string; name: string; slug: string }[];
}

interface CatalogContainerProps {
  products: Product[];
  brandName: string;
}

export function CatalogContainer({ products, brandName }: CatalogContainerProps) {
  const [search, setSearch] = React.useState('');
  const [selectedCategorySlug, setSelectedCategorySlug] = React.useState<string | null>(null);

  // Extract unique categories dynamically from products list
  const categories = React.useMemo(() => {
    const map = new Map<string, { id: string; name: string; slug: string }>();
    products.forEach((p) => {
      p.categories.forEach((c) => {
        map.set(c.slug, c);
      });
    });
    return Array.from(map.values());
  }, [products]);

  // Filter products based on search query and category slug
  const filteredProducts = React.useMemo(() => {
    return products.filter((p) => {
      const matchesSearch =
        p.title.toLowerCase().includes(search.toLowerCase()) ||
        p.description.toLowerCase().includes(search.toLowerCase());
      
      const matchesCategory =
        !selectedCategorySlug ||
        p.categories.some((c) => c.slug === selectedCategorySlug);

      return matchesSearch && matchesCategory;
    });
  }, [products, search, selectedCategorySlug]);

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 flex-1 flex flex-col animate-in fade-in duration-300">
      {/* Search & Filter Row */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10 pb-6 border-b border-border/50">
        <div>
          <h2 className="text-2xl font-extrabold tracking-tight text-foreground mb-1">
            Available Products
          </h2>
          <p className="text-xs text-foreground/50">
            Browse and purchase high-quality digital assets.
          </p>
        </div>
        <SearchBox value={search} onChange={setSearch} />
      </div>

      {/* Category Pills Row */}
      {categories.length > 0 && (
        <div className="mb-8">
          <CategoryFilter
            categories={categories}
            selectedSlug={selectedCategorySlug}
            onSelect={setSelectedCategorySlug}
          />
        </div>
      )}

      {/* Product Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
        {filteredProducts.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>

      {/* Empty State */}
      {filteredProducts.length === 0 && (
        <div className="flex flex-col items-center justify-center text-center py-20 border border-dashed border-border rounded-2xl bg-card/40">
          <span className="text-4xl mb-4 select-none">🔍</span>
          <h3 className="text-lg font-bold text-foreground mb-1">No products found</h3>
          <p className="text-xs text-foreground/50 max-w-sm">
            We couldn't find any products matching your current query. Try adjusting your search keywords or filters.
          </p>
        </div>
      )}
    </section>
  );
}
