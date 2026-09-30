'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { BrandData } from '@/features/brand/brand-context.resolver';
import { ThemeToggle } from './portfolio/theme-toggle';
import { CurrencySelector } from './currency-selector';

interface HeaderProps {
  brand: BrandData;
}

export function Header({ brand }: HeaderProps) {
  const pathname = usePathname();

  // Hide storefront header on admin control center to prevent double navbar
  if (pathname?.startsWith('/admin')) {
    return null;
  }

  const navLinks = [
    { label: 'Store', href: '/store' },
    { label: 'Collections', href: '/categories' },
    { label: 'Studio & Craft', href: '/about' },
    { label: 'Support & Docs', href: '/support' },
  ];

  return (
    <header className="sticky top-0 z-50 w-full bg-background/80 backdrop-blur-2xl border-b border-border/50 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-14 flex items-center justify-between gap-4">
        {/* Brand Identity */}
        <Link href="/" className="flex items-center gap-2.5 hover:opacity-85 transition-opacity group">
          {brand.logoUrl ? (
            <img src={brand.logoUrl} alt={brand.name || 'Commerza'} className="h-6 w-auto object-contain" />
          ) : (
            <div className="w-7 h-7 rounded-lg bg-foreground text-background flex items-center justify-center font-black text-xs select-none shadow-xs group-hover:scale-105 transition-transform">
              C
            </div>
          )}
          <div className="flex items-center gap-1.5">
            <span className="text-sm font-black tracking-tight text-foreground">
              {brand.name || 'Commerza'}
            </span>
            <span className="text-[9px] font-mono uppercase px-1.5 py-0.5 rounded bg-foreground/5 text-foreground/50 border border-border/40">
              Studio
            </span>
          </div>
        </Link>

        {/* Minimalist Studio Navigation */}
        <nav className="hidden md:flex items-center gap-1 text-xs font-medium">
          {navLinks.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`px-3 py-1.5 rounded-full transition-all text-xs font-semibold ${
                  isActive
                    ? 'text-foreground bg-foreground/10 shadow-xs'
                    : 'text-foreground/60 hover:text-foreground hover:bg-foreground/5'
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>

        {/* Actions: Vault, Currency Switcher, Theme Toggle, Admin Gateway */}
        <div className="flex items-center gap-2.5">
          <Link
            href="/my-orders"
            className="text-[11px] font-semibold text-foreground/70 hover:text-foreground border border-border/80 hover:border-foreground/30 px-3 py-1.5 rounded-full transition-all bg-card/50 hover:bg-card flex items-center gap-1"
            title="Access Purchased Digital Vault"
          >
            <span>📦</span>
            <span className="hidden sm:inline">My Vault</span>
          </Link>
          <CurrencySelector />
          <ThemeToggle />
          <Link
            href="/admin"
            className="text-[11px] font-semibold text-foreground/70 hover:text-foreground border border-border/80 hover:border-foreground/30 px-3 py-1.5 rounded-full transition-all bg-card/50 hover:bg-card"
            title="Open Admin Control Center"
          >
            Control Center
          </Link>
        </div>
      </div>
    </header>
  );
}
