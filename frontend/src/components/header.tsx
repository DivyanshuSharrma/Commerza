import Link from 'next/link';
import { BrandData } from '@/features/brand/brand-context.resolver';

interface HeaderProps {
  brand: BrandData;
}

export function Header({ brand }: HeaderProps) {
  return (
    <header className="sticky top-0 z-40 w-full bg-card/85 backdrop-blur-md border-b border-border transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-3 hover:opacity-90 transition-opacity">
          {brand.logoUrl ? (
            <img src={brand.logoUrl} alt={brand.name} className="h-8 w-auto object-contain" />
          ) : (
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center text-white font-extrabold shadow-sm select-none">
              {brand.name.substring(0, 1).toUpperCase()}
            </div>
          )}
          <span className="text-lg font-bold tracking-tight text-foreground">
            {brand.name}
          </span>
        </Link>
        <nav className="flex items-center gap-6">
          <Link href="/" className="text-sm font-medium text-foreground/75 hover:text-foreground transition-colors">
            Home
          </Link>
        </nav>
      </div>
    </header>
  );
}
