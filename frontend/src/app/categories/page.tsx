import Link from 'next/link';
import { getBrandContext } from '@/features/brand/brand-context.resolver';

async function getCategories() {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api';
  try {
    const res = await fetch(`${apiUrl}/v1/categories`, { cache: 'no-store' });
    if (!res.ok) return [];
    const body = await res.json();
    return body.data || [];
  } catch (err) {
    return [];
  }
}

async function getProducts(brandId: string) {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api';
  try {
    const res = await fetch(`${apiUrl}/v1/products?brandId=${brandId}`, { cache: 'no-store' });
    if (!res.ok) return [];
    const body = await res.json();
    return body.data || [];
  } catch (err) {
    return [];
  }
}

export default async function CategoriesPage() {
  const brand = await getBrandContext();
  const [categories, products] = await Promise.all([
    getCategories(),
    getProducts(brand.id),
  ]);

  const activeProducts = products.filter((p: any) => p.status === 'ACTIVE');

  // Compute product count per category
  const categoriesWithProducts = categories.map((cat: any) => {
    const matched = activeProducts.filter((p: any) =>
      (p.categories || []).some((c: any) => c.id === cat.id || c.slug === cat.slug)
    );
    return {
      ...cat,
      products: matched,
      count: matched.length,
    };
  });

  return (
    <div className="py-12 md:py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
      <div className="text-center max-w-2xl mx-auto space-y-2">
        <span className="text-xs font-bold uppercase tracking-wider text-primary">
          Browse by Domain
        </span>
        <h1 className="text-4xl sm:text-5xl font-black text-foreground tracking-tight">
          Categories & Collections
        </h1>
        <p className="text-sm text-foreground/70">
          Find the exact architecture, boilerplate, or design system required for your next build.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {categoriesWithProducts.length > 0 ? (
          categoriesWithProducts.map((cat: any) => (
            <div
              key={cat.id}
              className="bg-card border border-border/80 rounded-3xl p-8 shadow-xs flex flex-col justify-between hover:shadow-lg transition-all"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-2xl">📦</span>
                  <span className="text-xs font-bold bg-primary/10 text-primary px-3 py-1 rounded-full">
                    {cat.count} {cat.count === 1 ? 'Artifact' : 'Artifacts'}
                  </span>
                </div>
                <h3 className="text-2xl font-black text-foreground">{cat.name}</h3>
                <p className="text-xs text-foreground/70">
                  {cat.description || 'Curated digital products engineered for modern technical workflows.'}
                </p>

                {cat.products.length > 0 && (
                  <div className="pt-4 space-y-2">
                    <div className="text-[11px] font-bold uppercase text-foreground/50 tracking-wider">
                      Featured in this collection:
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {cat.products.slice(0, 3).map((p: any) => (
                        <Link
                          key={p.id}
                          href={`/products/${p.slug}`}
                          className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-surface-muted hover:bg-border/60 text-foreground transition-colors inline-block"
                        >
                          {p.title} (${p.salePrice || p.price})
                        </Link>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="mt-8 pt-6 border-t border-border/60 flex items-center justify-between">
                <span className="text-xs text-foreground/50">Verified production code</span>
                <Link
                  href="/store"
                  className="text-xs font-bold text-primary hover:underline inline-flex items-center gap-1"
                >
                  <span>View All In Store</span>
                  <span>&gt;</span>
                </Link>
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-2 text-center py-20 bg-card rounded-3xl border border-dashed border-border/80">
            <h3 className="text-lg font-bold text-foreground mb-1">Collections Loading</h3>
            <p className="text-xs text-foreground/60">
              Visit our store to browse all current digital releases.
            </p>
            <div className="mt-4">
              <Link href="/store" className="px-5 py-2 bg-primary text-white rounded-xl text-xs font-bold">
                Visit Store
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
