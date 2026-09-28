'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useCurrency, CurrencyCode } from '@/features/currency/currency-context';

export function CurrencySelector({ className = '' }: { className?: string }) {
  const { currency, currencyConfig, setCurrency, availableCurrencies } = useCurrency();
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div ref={containerRef} className={`relative inline-block text-left ${className}`}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-surface-muted/80 hover:bg-surface-muted border border-border/80 text-foreground transition-all cursor-pointer backdrop-blur-md"
        title="Change store currency"
      >
        <span>{currencyConfig.flag}</span>
        <span className="font-mono">{currencyConfig.code}</span>
        <span className="text-[10px] text-foreground/50">▾</span>
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-1.5 w-36 rounded-2xl bg-card/95 border border-border/90 shadow-xl backdrop-blur-xl z-50 py-1.5 animate-in fade-in zoom-in-95 duration-150">
          <div className="px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-foreground/45 border-b border-border/40 mb-1">
            Store Currency
          </div>
          {availableCurrencies.map((c) => {
            const isSelected = c.code === currency;
            return (
              <button
                key={c.code}
                type="button"
                onClick={() => {
                  setCurrency(c.code as CurrencyCode);
                  setIsOpen(false);
                }}
                className={`w-full flex items-center justify-between px-3 py-1.5 text-xs text-left transition-colors cursor-pointer ${
                  isSelected
                    ? 'bg-primary/10 text-primary font-bold'
                    : 'text-foreground/80 hover:bg-foreground/5 hover:text-foreground'
                }`}
              >
                <div className="flex items-center gap-2">
                  <span>{c.flag}</span>
                  <span className="font-medium">{c.code}</span>
                </div>
                <span className="text-[11px] text-foreground/50 font-mono">{c.symbol}</span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
