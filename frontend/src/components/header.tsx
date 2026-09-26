'use client';

import { useState } from 'react';
import Link from 'next/link';
import { BrandData } from '@/features/brand/brand-context.resolver';
import { OrderRecoveryModal } from './order-recovery-modal';
import { ThemeToggle } from './portfolio/theme-toggle';

interface HeaderProps {
  brand: BrandData;
}

export function Header({ brand }: HeaderProps) {
  const [isRecoveryOpen, setIsRecoveryOpen] = useState(false);

  return (
    <>
      <header className="sticky top-0 z-40 w-full bg-card/80 backdrop-blur-xl border-b border-border/70 transition-all">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
          {/* Brand Logo & Name */}
          <Link href="/" className="flex items-center gap-3 hover:opacity-90 transition-opacity">
            {brand.logoUrl ? (
              <img src={brand.logoUrl} alt={brand.name} className="h-8 w-auto object-contain" />
            ) : (
              <div className="w-8 h-8 rounded-xl bg-primary flex items-center justify-center text-white font-extrabold shadow-sm select-none text-sm">
                {brand.name.substring(0, 1).toUpperCase()}
              </div>
            )}
            <div className="flex flex-col">
              <span className="text-base font-extrabold tracking-tight text-foreground leading-none">
                {brand.name}
              </span>
              <span className="text-[10px] font-semibold text-foreground/50 tracking-wider uppercase mt-0.5">
                Digital Atelier
              </span>
            </div>
          </Link>

          {/* Center Navigation Links (Hidden on small mobile) */}
          <nav className="hidden md:flex items-center gap-6 text-xs font-semibold text-foreground/75">
            <a href="#goods" className="hover:text-primary transition-colors">
              Artifacts & Goods
            </a>
            <a href="#philosophy" className="hover:text-primary transition-colors">
              Philosophy
            </a>
            <a href="#faq" className="hover:text-primary transition-colors">
              FAQ
            </a>
            <Link href="/admin" className="hover:text-primary transition-colors text-foreground/50">
              Admin Portal
            </Link>
          </nav>

          {/* Right Action Hub: Theme Switcher & Order Recovery */}
          <div className="flex items-center gap-3">
            <ThemeToggle />

            <button
              onClick={() => setIsRecoveryOpen(true)}
              className="text-xs font-semibold text-foreground/80 hover:text-primary transition-colors flex items-center gap-1.5 border border-border/80 bg-surface-muted/50 hover:bg-surface-muted px-3 py-1.5 rounded-xl cursor-pointer shadow-2xs"
            >
              <span>📦</span>
              <span className="hidden sm:inline">Find My Orders</span>
            </button>
          </div>
        </div>
      </header>

      <OrderRecoveryModal
        isOpen={isRecoveryOpen}
        onClose={() => setIsRecoveryOpen(false)}
        brandId={brand.id}
      />
    </>
  );
}
