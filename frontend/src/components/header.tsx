'use client';

import { useState } from 'react';
import Link from 'next/link';
import { BrandData } from '@/features/brand/brand-context.resolver';
import { OrderRecoveryModal } from './order-recovery-modal';

interface HeaderProps {
  brand: BrandData;
}

export function Header({ brand }: HeaderProps) {
  const [isRecoveryOpen, setIsRecoveryOpen] = useState(false);

  return (
    <>
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
          <nav className="flex items-center gap-4">
            <Link href="/" className="text-sm font-medium text-foreground/75 hover:text-foreground transition-colors">
              Store
            </Link>
            <button
              onClick={() => setIsRecoveryOpen(true)}
              className="text-xs font-semibold text-foreground/80 hover:text-primary transition-colors flex items-center gap-1.5 border border-border px-3 py-1.5 rounded-lg hover:border-primary/50 cursor-pointer"
            >
              <span>📦</span>
              <span>Find My Orders</span>
            </button>
          </nav>
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
