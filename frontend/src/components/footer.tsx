'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { BrandData } from '@/features/brand/brand-context.resolver';

interface FooterProps {
  brand: BrandData;
}

export function Footer({ brand }: FooterProps) {
  const pathname = usePathname();

  // Hide storefront footer on admin dashboard
  if (pathname?.startsWith('/admin')) {
    return null;
  }

  const brandName = brand.name || 'Commerza';
  const supportEmail = `support@${brand.subdomain === 'default' ? 'commerza.com' : `${brand.subdomain}.com`}`;

  return (
    <footer className="bg-card/40 border-t border-border/50 mt-auto py-14 text-xs text-foreground/60 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8">
          {/* Brand Manifesto Col */}
          <div className="space-y-3 col-span-2">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded bg-foreground text-background flex items-center justify-center font-black text-xs select-none">
                C
              </div>
              <span className="text-sm font-black text-foreground tracking-tight">
                {brandName}
              </span>
            </div>
            <p className="text-xs text-foreground/60 leading-relaxed max-w-sm">
              An independent digital engineering studio crafting verified architectural boilerplates, design systems, and production cloud kits.
            </p>
            <div className="flex items-center gap-2 text-[10px] font-mono text-emerald-500 pt-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span>All Delivery Pipelines Operational [ 99.98% ]</span>
            </div>
          </div>

          {/* Col 2: Artifacts */}
          <div className="space-y-2.5">
            <span className="text-[10px] font-mono uppercase tracking-widest text-foreground/50 block font-bold">
              Catalog
            </span>
            <ul className="space-y-2 text-xs">
              <li>
                <Link href="/store" className="hover:text-foreground transition-colors">
                  Digital Artifacts
                </Link>
              </li>
              <li>
                <Link href="/categories" className="hover:text-foreground transition-colors">
                  Architecture Collections
                </Link>
              </li>
              <li>
                <Link href="/store" className="hover:text-foreground transition-colors">
                  Featured Releases
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 3: Studio */}
          <div className="space-y-2.5">
            <span className="text-[10px] font-mono uppercase tracking-widest text-foreground/50 block font-bold">
              Studio
            </span>
            <ul className="space-y-2 text-xs">
              <li>
                <Link href="/about" className="hover:text-foreground transition-colors">
                  Manifesto & Philosophy
                </Link>
              </li>
              <li>
                <Link href="/about#persona" className="hover:text-foreground transition-colors">
                  Principal Advisory
                </Link>
              </li>
              <li>
                <Link href="/support" className="hover:text-foreground transition-colors">
                  License & Recovery
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 4: Platform */}
          <div className="space-y-2.5">
            <span className="text-[10px] font-mono uppercase tracking-widest text-foreground/50 block font-bold">
              Infrastructure
            </span>
            <ul className="space-y-2 text-xs">
              <li>
                <Link href="/admin" className="hover:text-foreground transition-colors">
                  Merchant Control Center
                </Link>
              </li>
              <li>
                <a href={`mailto:${supportEmail}`} className="hover:text-foreground transition-colors">
                  Priority Direct Support
                </a>
              </li>
              <li>
                <Link href="/support" className="hover:text-foreground transition-colors">
                  Token Reissuance
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-border/40 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-foreground/45 font-mono">
          <div>
            &copy; {new Date().getFullYear()} {brandName} Atelier. Engineered for High-Concurrency Production.
          </div>
          <div className="flex gap-4">
            <Link href="/privacy" className="hover:text-foreground cursor-pointer transition-colors">
              Privacy Framework
            </Link>
            <span>&bull;</span>
            <Link href="/terms" className="hover:text-foreground cursor-pointer transition-colors">
              Terms of Sale
            </Link>
            <span>&bull;</span>
            <Link href="/license" className="hover:text-foreground cursor-pointer transition-colors">
              Single-License MIT
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
