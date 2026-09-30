import { Suspense } from 'react';
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
    <div className="flex flex-col flex-1 py-12 md:py-20 studio-mesh">
      {/* Studio Keynote Header */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-12 space-y-4">
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-mono uppercase tracking-widest text-primary font-bold px-2.5 py-1 rounded-full bg-primary/10 border border-primary/20">
            ✦ Commerza Production Catalog
          </span>
          <span className="text-[10px] font-mono text-emerald-500 font-bold hidden sm:inline-flex items-center gap-1.5 bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            Active Releases Online
          </span>
        </div>

        <h1 className="text-4xl sm:text-6xl font-black text-foreground tracking-tight leading-[1.08] max-w-4xl">
          Store. The best way to acquire <span className="text-gradient-silver">digital engineering.</span>
        </h1>

        <p className="text-sm sm:text-base text-foreground/70 max-w-2xl leading-relaxed">
          Explore production-verified software architectures, design systems, and cloud boilerplates. Instant tokenized artifact delivery upon checkout.
        </p>

        {/* Live Studio Assurance Highlights */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-4 max-w-3xl">
          <div className="p-3 rounded-2xl bg-card/60 border border-border/60 backdrop-blur-md space-y-1">
            <div className="text-[10px] font-mono text-foreground/50 uppercase">Delivery Speed</div>
            <div className="text-xs font-bold text-foreground flex items-center gap-1.5">
              <span>⚡</span> &lt; 2s Token Unlock
            </div>
          </div>
          <div className="p-3 rounded-2xl bg-card/60 border border-border/60 backdrop-blur-md space-y-1">
            <div className="text-[10px] font-mono text-foreground/50 uppercase">Verification</div>
            <div className="text-xs font-bold text-foreground flex items-center gap-1.5">
              <span>🛡️</span> 100% Type-Safe & Audited
            </div>
          </div>
          <div className="p-3 rounded-2xl bg-card/60 border border-border/60 backdrop-blur-md space-y-1">
            <div className="text-[10px] font-mono text-foreground/50 uppercase">Access Model</div>
            <div className="text-xs font-bold text-foreground flex items-center gap-1.5">
              <span>💎</span> Lifetime Git & ZIP
            </div>
          </div>
          <div className="p-3 rounded-2xl bg-card/60 border border-border/60 backdrop-blur-md space-y-1">
            <div className="text-[10px] font-mono text-foreground/50 uppercase">Licensing</div>
            <div className="text-xs font-bold text-foreground flex items-center gap-1.5">
              <span>📜</span> Commercial MIT
            </div>
          </div>
        </div>
      </div>

      {/* Main Works & Products Catalog */}
      <Suspense
        fallback={
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 animate-pulse space-y-6">
            <div className="h-12 bg-card/60 rounded-2xl border border-border/70" />
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              <div className="h-72 bg-card/40 rounded-3xl border border-border/60" />
              <div className="h-72 bg-card/40 rounded-3xl border border-border/60" />
              <div className="h-72 bg-card/40 rounded-3xl border border-border/60" />
            </div>
          </div>
        }
      >
        <WorksStoreSection products={activeProducts} brandName={brand.name} />
      </Suspense>
    </div>
  );
}
