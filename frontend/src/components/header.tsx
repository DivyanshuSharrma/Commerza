'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { BrandData } from '@/features/brand/brand-context.resolver';
import { ThemeToggle } from './portfolio/theme-toggle';

interface HeaderProps {
  brand: BrandData;
}

export function Header({ brand }: HeaderProps) {
  const pathname = usePathname();

  const navLinks = [
    { label: 'Store', href: '/store' },
    { label: 'Categories', href: '/categories' },
    { label: 'About', href: '/about' },
    { label: 'Support', href: '/support' },
  ];

  return (
    <header className="sticky top-0 z-50 w-full bg-background/80 backdrop-blur-xl border-b border-border/60 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-14 flex items-center justify-between gap-4">
        {/* Brand Logo & Name */}
        <Link href="/" className="flex items-center gap-2.5 hover:opacity-85 transition-opacity">
          {brand.logoUrl ? (
            <img src={brand.logoUrl} alt={brand.name || 'Commerza'} className="h-6 w-auto object-contain" />
          ) : (
            <div className="w-7 h-7 rounded-lg bg-foreground text-background flex items-center justify-center font-black text-xs select-none shadow-xs">
              C
            </div>
          )}
          <span className="text-sm font-extrabold tracking-tight text-foreground">
            {brand.name || 'Commerza'}
          </span>
        </Link>

        {/* Apple-style minimalist Center Navigation Links */}
        <nav className="flex items-center gap-1 sm:gap-6 text-xs font-medium text-foreground/75">
          {navLinks.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`px-2.5 py-1 rounded-full transition-all ${
                  isActive
                    ? 'text-foreground font-bold bg-foreground/5'
                    : 'hover:text-foreground text-foreground/70'
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>

        {/* Right Actions: Theme Toggle & Admin Access */}
        <div className="flex items-center gap-2.5">
          <ThemeToggle />
          <Link
            href="/admin"
            className="text-[11px] font-semibold text-foreground/60 hover:text-foreground border border-border/80 px-2.5 py-1 rounded-full transition-colors hidden sm:inline-block"
            title="Admin Dashboard"
          >
            Admin
          </Link>
        </div>
      </div>
    </header>
  );
}
