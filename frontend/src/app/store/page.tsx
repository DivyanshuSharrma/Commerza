import { getBrandContext } from '@/features/brand/brand-context.resolver';
import { WorksStoreSection } from '@/components/portfolio/works-store-section';

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

export default async function StorePage() {
  const brand = await getBrandContext();
  const products = await getProducts(brand.id);
  const activeProducts = products.filter((p: any) => p.status === 'ACTIVE');

  return (
    <div className="flex flex-col flex-1 py-10 md:py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-8">
        <span className="text-xs font-bold uppercase tracking-wider text-primary">
          Commerza Catalog
        </span>
        <h1 className="text-4xl sm:text-5xl font-black text-foreground tracking-tight mt-1 mb-3">
          Store. The best way to buy digital engineering.
        </h1>
        <p className="text-sm text-foreground/70 max-w-2xl">
          Explore all production-ready digital artifacts, complete codebases, and curated UI frameworks. Instant token delivery upon checkout.
        </p>
      </div>

      <WorksStoreSection products={activeProducts} brandName={brand.name} />
    </div>
  );
}
