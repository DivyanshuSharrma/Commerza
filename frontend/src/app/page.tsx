import { getBrandContext } from '@/features/brand/brand-context.resolver';
import { PortfolioLanding } from '@/components/portfolio/portfolio-landing';

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

  return <PortfolioLanding brand={brand} products={activeProducts} />;
}
