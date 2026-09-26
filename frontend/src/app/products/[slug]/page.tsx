import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { getBrandContext } from '@/features/brand/brand-context.resolver';
import { PriceComponent } from '@/components/price-component';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { ProductGallery } from '@/components/product-gallery';

/* ─── Types ─────────────────────────────────────────── */
interface ProductMedia {
  id: string;
  url: string;
  isPrimary: boolean;
  position: number;
}

interface Product {
  id: string;
  title: string;
  slug: string;
  description: string;
  shortDescription?: string;
  price: string;
  salePrice?: string | null;
  features?: string;
  specifications?: string;
  whatsIncluded?: string;
  deliveryType: 'INTERNAL_FILE' | 'EXTERNAL_URL';
  seoTitle?: string;
  seoDescription?: string;
  seoKeywords?: string;
  media: ProductMedia[];
  categories: { id: string; name: string; slug: string }[];
}

/* ─── Data Fetchers ─────────────────────────────────── */
async function getProduct(brandId: string, slug: string): Promise<Product | null> {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api';
  try {
    const res = await fetch(`${apiUrl}/v1/products/slug/${brandId}/${slug}`, {
      cache: 'no-store',
    });
    if (!res.ok) return null;
    const body = await res.json();
    return body.data || null;
  } catch {
    return null;
  }
}

async function getRelatedProducts(brandId: string, currentProductId: string): Promise<Product[]> {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api';
  try {
    const res = await fetch(`${apiUrl}/v1/products?brandId=${brandId}`, {
      cache: 'no-store',
    });
    if (!res.ok) return [];
    const body = await res.json();
    const list = body.data || [];
    return list
      .filter((p: Product) => p.id !== currentProductId)
      .slice(0, 3);
  } catch {
    return [];
  }
}

/* ─── Helpers ────────────────────────────────────────── */
const API_STORAGE = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api') + '/storage/local/';

function resolveMediaUrl(url: string): string {
  if (!url) return '';
  if (url.startsWith('http')) return url;
  return `${API_STORAGE}${url}`;
}

function parseLines(text?: string): string[] {
  if (!text) return [];
  return text.split('\n').map((l) => l.trim()).filter(Boolean);
}

/* ─── Metadata ───────────────────────────────────────── */
interface ProductPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: ProductPageProps): Promise<Metadata> {
  const { slug } = await params;
  const brand = await getBrandContext();
  const product = await getProduct(brand.id, slug);
  if (!product) return {};

  const primaryMedia = product.media.find((m) => m.isPrimary) ?? product.media[0];
  const ogImage = primaryMedia ? resolveMediaUrl(primaryMedia.url) : undefined;

  return {
    title: product.seoTitle || product.title,
    description: product.seoDescription || (product.shortDescription ?? product.description.substring(0, 160)),
    keywords: product.seoKeywords || '',
    openGraph: {
      title: product.seoTitle || product.title,
      description: product.seoDescription || product.description.substring(0, 160),
      type: 'article',
      images: ogImage ? [{ url: ogImage }] : [],
    },
  };
}

/* ─── Page Component ─────────────────────────────────── */
export default async function ProductPage({ params }: ProductPageProps) {
  const { slug } = await params;
  const brand = await getBrandContext();
  const product = await getProduct(brand.id, slug);

  if (!product) notFound();

  const related = await getRelatedProducts(brand.id, product.id);

  // Sort media by position
  const sortedMedia = [...(product.media ?? [])].sort((a, b) => a.position - b.position);
  const mediaUrls = sortedMedia.map((m) => resolveMediaUrl(m.url));

  const features = parseLines(product.features);
  const specs = parseLines(product.specifications);
  const included = parseLines(product.whatsIncluded);

  const hasSalePrice = product.salePrice !== null && product.salePrice !== undefined && Number(product.salePrice) > 0;
  const discountPct = hasSalePrice
    ? Math.round((1 - Number(product.salePrice) / Number(product.price)) * 100)
    : 0;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 flex-1">
      {/* Back button */}
      <Link
        href="/"
        className="inline-flex items-center gap-2 text-xs font-semibold text-foreground/50 hover:text-foreground mb-8 transition-colors"
      >
        ← Back to Catalog
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-16">
        {/* ── Gallery Column ── */}
        <ProductGallery images={mediaUrls} title={product.title} />

        {/* ── Info Column ── */}
        <div className="flex flex-col justify-start">
          {/* Category badges */}
          {product.categories.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-4">
              {product.categories.map((c) => (
                <Badge key={c.id} variant="primary">
                  {c.name}
                </Badge>
              ))}
            </div>
          )}

          {/* Title */}
          <h1 className="text-3xl sm:text-4xl font-extrabold text-foreground tracking-tight mb-3">
            {product.title}
          </h1>

          {/* Short description */}
          {product.shortDescription && (
            <p className="text-foreground/65 text-base leading-relaxed mb-5">
              {product.shortDescription}
            </p>
          )}

          {/* Pricing */}
          <div className="flex items-end gap-3 mb-6">
            {hasSalePrice ? (
              <>
                <span className="text-4xl font-extrabold text-foreground">
                  ₹{Number(product.salePrice).toFixed(2)}
                </span>
                <span className="text-xl line-through text-foreground/40 mb-1">
                  ₹{Number(product.price).toFixed(2)}
                </span>
                <span className="bg-green-500/15 text-green-600 text-xs font-bold px-2 py-1 rounded-lg mb-1">
                  {discountPct}% OFF
                </span>
              </>
            ) : (
              <PriceComponent price={product.price} className="mb-0" priceClassName="text-4xl" />
            )}
          </div>

          {/* Buy Now CTA */}
          <Link
            href={`/checkout?productId=${product.id}`}
            className="w-full sm:w-auto inline-flex items-center justify-center rounded-xl text-sm font-bold bg-primary text-white hover:opacity-90 active:scale-[0.98] px-8 py-3.5 cursor-pointer shadow-md transition-all text-center mb-8"
          >
            Buy Now — {hasSalePrice ? `₹${Number(product.salePrice).toFixed(2)}` : `₹${Number(product.price).toFixed(2)}`}
          </Link>

          {/* Trust badges */}
          <div className="flex flex-wrap gap-4 text-xs text-foreground/60 mb-8 pb-8 border-b border-border/60">
            <span className="flex items-center gap-1.5">
              <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
              Secure Payment
            </span>
            <span className="flex items-center gap-1.5">
              <svg className="w-4 h-4 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
              Instant Delivery
            </span>
            <span className="flex items-center gap-1.5">
              <svg className="w-4 h-4 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
              Email Support
            </span>
          </div>

          {/* Full Description */}
          <div className="mb-6">
            <h3 className="text-sm font-bold text-foreground mb-3">About This Product</h3>
            <p className="whitespace-pre-line text-sm text-foreground/75 leading-relaxed">
              {product.description}
            </p>
          </div>
        </div>
      </div>

      {/* ── Features / Specs / Included ─────────────────── */}
      {(features.length > 0 || specs.length > 0 || included.length > 0) && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16 border-t border-border/60 pt-12">
          {features.length > 0 && (
            <div className="bg-card border border-border rounded-2xl p-6">
              <h3 className="font-bold text-foreground mb-4 flex items-center gap-2">
                <span className="text-primary">✦</span> Key Features
              </h3>
              <ul className="space-y-2">
                {features.map((f, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-foreground/75">
                    <span className="text-green-500 mt-0.5 flex-shrink-0">✓</span>
                    {f}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {specs.length > 0 && (
            <div className="bg-card border border-border rounded-2xl p-6">
              <h3 className="font-bold text-foreground mb-4 flex items-center gap-2">
                <span className="text-primary">✦</span> Specifications
              </h3>
              <ul className="space-y-2">
                {specs.map((s, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-foreground/75">
                    <span className="text-blue-400 mt-0.5 flex-shrink-0">•</span>
                    {s}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {included.length > 0 && (
            <div className="bg-card border border-border rounded-2xl p-6">
              <h3 className="font-bold text-foreground mb-4 flex items-center gap-2">
                <span className="text-primary">✦</span> What&apos;s Included
              </h3>
              <ul className="space-y-2">
                {included.map((item, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-foreground/75">
                    <span className="text-primary mt-0.5 flex-shrink-0">📦</span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {/* ── Related Products ─────────────────────────────── */}
      {related.length > 0 && (
        <div className="border-t border-border/60 pt-12 animate-in fade-in duration-500">
          <h2 className="text-xl font-extrabold text-foreground mb-8">You Might Also Like</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {related.map((p) => {
              const relatedSorted = [...(p.media ?? [])].sort((a, b) => a.position - b.position);
              const thumb = relatedSorted.find((m) => m.isPrimary) ?? relatedSorted[0];
              const thumbUrl = thumb ? resolveMediaUrl(thumb.url) : null;
              const hasSale = p.salePrice != null && Number(p.salePrice) > 0;
              return (
                <Card key={p.id} className="flex flex-col group hover:shadow-md transition-all duration-300 transform hover:-translate-y-1">
                  <Link href={`/products/${p.slug}`} className="block relative aspect-video overflow-hidden bg-foreground/5 border-b border-border">
                    {thumbUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={thumbUrl} alt={p.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-foreground/30 font-bold select-none text-xs">No Image</div>
                    )}
                  </Link>
                  <div className="p-5 flex-1 flex flex-col justify-between">
                    <Link href={`/products/${p.slug}`}>
                      <h3 className="font-bold text-foreground group-hover:text-primary transition-colors line-clamp-1 mb-2">
                        {p.title}
                      </h3>
                    </Link>
                    <div className="flex items-center justify-between">
                      <div>
                        {hasSale ? (
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-foreground">₹{Number(p.salePrice).toFixed(2)}</span>
                            <span className="text-xs line-through text-foreground/40">₹{Number(p.price).toFixed(2)}</span>
                          </div>
                        ) : (
                          <PriceComponent price={p.price} priceClassName="text-lg" />
                        )}
                      </div>
                      <Link href={`/products/${p.slug}`} className="text-xs font-semibold text-primary hover:underline">
                        View →
                      </Link>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
