import { getBrandContext } from '@/features/brand/brand-context.resolver';
import { CatalogContainer } from '@/components/catalog-container';

async function getProducts(brandId: string) {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api';
  try {
    const res = await fetch(`${apiUrl}/v1/products?brandId=${brandId}`, {
      cache: 'no-store',
    });
    if (!res.ok) return [];
    const body = await res.json();
    return body.data || [];
  } catch (err) {
    return [];
  }
}

export default async function Home() {
  const brand = await getBrandContext();
  const products = await getProducts(brand.id);
  const activeProducts = products.filter((p: any) => p.status === 'ACTIVE');

  return (
    <div className="flex flex-col flex-1">
      {/* Brand Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-primary/10 via-background to-secondary/10 border-b border-border py-20 lg:py-28">
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center animate-in fade-in duration-300">
          <h1 className="text-4xl sm:text-5xl font-extrabold text-foreground tracking-tight max-w-3xl mx-auto mb-6">
            {brand.themeSettings?.heroTitle || 'Premium Digital Products'}
          </h1>
          <p className="text-base sm:text-lg text-foreground/75 max-w-2xl mx-auto">
            {brand.themeSettings?.heroSubtitle || 'Discover and download premium digital assets instantly.'}
          </p>
        </div>
      </section>

      {/* Catalog Grid */}
      <CatalogContainer products={activeProducts} brandName={brand.name} />
    </div>
  );
}
