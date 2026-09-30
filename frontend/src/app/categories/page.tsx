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

const CATEGORY_ICONS: Record<string, string> = {
  'saas-kits': '⚡',
  'ui-design-systems': '🎨',
  'backend-cloud': '☁️',
  'ai-agentic-systems': '🤖',
};

const CATEGORY_TAGS: Record<string, string[]> = {
  'saas-kits': ['Next.js 16', 'NestJS', 'Prisma', 'Stripe Billing'],
  'ui-design-systems': ['React 19', 'Tailwind v4', 'Figma Tokens', 'WCAG AAA'],
  'backend-cloud': ['Redis Cluster', 'Token Bucket', 'Kubernetes', 'Fastify'],
  'ai-agentic-systems': ['Multi-Agent', 'Vector Memory', 'Streaming Tools', 'OpenAI/Gemini'],
};

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
    <div className="py-14 md:py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16 studio-mesh">
      {/* Header */}
      <div className="text-center max-w-3xl mx-auto space-y-4">
        <span className="text-[10px] font-mono uppercase tracking-widest text-primary font-bold px-3 py-1 rounded-full bg-primary/10 border border-primary/20">
          ✦ System Architecture Blueprints
        </span>
        <h1 className="text-4xl sm:text-6xl font-black text-foreground tracking-tight leading-[1.08]">
          Curated <span className="text-gradient-silver">Collections.</span>
        </h1>
        <p className="text-xs sm:text-sm text-foreground/70 max-w-xl mx-auto leading-relaxed">
          Navigate digital engineering suites grouped by core technological domain. Everything is self-contained and ready for immediate deployment.
        </p>
      </div>

      {/* Grid of Domain Collections */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {categoriesWithProducts.map((cat: any, idx: number) => {
          const icon = CATEGORY_ICONS[cat.slug] || '📦';
          const tags = CATEGORY_TAGS[cat.slug] || ['TypeScript', 'Production Ready', 'Instant Delivery'];

          return (
            <div
              key={cat.id}
              className="cinematic-card rounded-3xl p-8 flex flex-col justify-between space-y-6 group relative overflow-hidden"
            >
              <div className="space-y-4">
                {/* Domain Header */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-3xl p-2.5 rounded-2xl bg-foreground/5 border border-border/50">
                      {icon}
                    </span>
                    <div>
                      <span className="text-[10px] font-mono uppercase text-foreground/40 font-bold block">
                        [ DOMAIN_0{idx + 1} ]
                      </span>
                      <h3 className="text-2xl font-black text-foreground group-hover:text-primary transition-colors">
                        {cat.name}
                      </h3>
                    </div>
                  </div>

                  <span className="text-xs font-mono font-bold bg-primary/10 text-primary border border-primary/20 px-3 py-1 rounded-full">
                    {cat.count} {cat.count === 1 ? 'Artifact' : 'Artifacts'}
                  </span>
                </div>

                <p className="text-xs sm:text-sm text-foreground/70 leading-relaxed">
                  {cat.description || 'Production-grade software architectures engineered with high-velocity standards.'}
                </p>

                {/* Tech Tags */}
                <div className="flex flex-wrap gap-1.5 pt-2">
                  {tags.map((t, i) => (
                    <span key={i} className="text-[10px] font-mono px-2.5 py-0.5 rounded-md bg-foreground/5 text-foreground/75 border border-border/40">
                      {t}
                    </span>
                  ))}
                </div>

                {/* Featured Products inside category */}
                {cat.products.length > 0 && (
                  <div className="pt-4 space-y-2 border-t border-border/40">
                    <div className="text-[10px] font-mono uppercase text-foreground/45 font-bold tracking-wider">
                      Featured in this collection:
                    </div>
                    <div className="space-y-1.5">
                      {cat.products.slice(0, 3).map((p: any) => (
                        <Link
                          key={p.id}
                          href={`/products/${p.slug}`}
                          className="flex items-center justify-between p-2.5 rounded-xl bg-surface-muted/60 hover:bg-border/60 text-foreground transition-all group/item text-xs font-semibold"
                        >
                          <span className="group-hover/item:text-primary transition-colors line-clamp-1">
                            {p.title}
                          </span>
                          <span className="font-mono text-[11px] text-foreground/70 ml-2 whitespace-nowrap">
                            ${p.salePrice || p.price} &rarr;
                          </span>
                        </Link>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Bottom Action */}
              <div className="pt-6 border-t border-border/50 flex items-center justify-between">
                <span className="text-[11px] font-mono text-foreground/50">Verified MIT Architecture</span>
                <Link
                  href={`/store?category=${cat.slug}`}
                  className="px-4 py-2 rounded-xl bg-foreground/5 hover:bg-foreground/10 text-foreground text-xs font-bold transition-all border border-border/60 hover:border-foreground/20"
                >
                  Explore Domain &rarr;
                </Link>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
