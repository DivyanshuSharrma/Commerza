import Link from 'next/link';
import { BrandData } from '@/features/brand/brand-context.resolver';

interface FooterProps {
  brand: BrandData;
}

export function Footer({ brand }: FooterProps) {
  const brandName = brand.name || 'Commerza';
  const supportEmail = `support@${brand.subdomain === 'default' ? 'commerza.com' : `${brand.subdomain}.com`}`;

  return (
    <footer className="bg-surface-muted/50 border-t border-border/70 mt-auto py-12 text-xs text-foreground/60 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {/* Col 1: Brand Info */}
          <div className="space-y-2 col-span-2 md:col-span-1">
            <span className="text-sm font-extrabold text-foreground tracking-tight block">
              {brandName}
            </span>
            <p className="text-xs text-foreground/60 leading-relaxed">
              Precision digital commerce engine and production-ready software architectures.
            </p>
          </div>

          {/* Col 2: Navigation */}
          <div className="space-y-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-foreground/80 block">
              Catalog
            </span>
            <ul className="space-y-1.5">
              <li>
                <Link href="/store" className="hover:text-foreground transition-colors">
                  Digital Store
                </Link>
              </li>
              <li>
                <Link href="/categories" className="hover:text-foreground transition-colors">
                  All Collections
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 3: Company */}
          <div className="space-y-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-foreground/80 block">
              Company
            </span>
            <ul className="space-y-1.5">
              <li>
                <Link href="/about" className="hover:text-foreground transition-colors">
                  About & Craft
                </Link>
              </li>
              <li>
                <Link href="/support" className="hover:text-foreground transition-colors">
                  Order Recovery
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 4: Platform */}
          <div className="space-y-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-foreground/80 block">
              Management
            </span>
            <ul className="space-y-1.5">
              <li>
                <Link href="/admin" className="hover:text-foreground transition-colors">
                  Admin Control Center
                </Link>
              </li>
              <li>
                <a href={`mailto:${supportEmail}`} className="hover:text-foreground transition-colors">
                  Contact Support
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="pt-6 border-t border-border/60 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-foreground/50">
          <div>
            Copyright &copy; {new Date().getFullYear()} {brandName} Inc. All rights reserved.
          </div>
          <div className="flex gap-4">
            <span className="hover:text-foreground cursor-pointer transition-colors">Privacy Policy</span>
            <span className="hover:text-foreground cursor-pointer transition-colors">Terms of Sale</span>
            <span className="hover:text-foreground cursor-pointer transition-colors">Commercial Licensing</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
