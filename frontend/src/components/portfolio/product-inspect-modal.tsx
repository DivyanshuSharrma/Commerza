'use client';

import * as React from 'react';
import Link from 'next/link';
import { PriceComponent } from '@/components/price-component';

interface Product {
  id: string;
  title: string;
  slug: string;
  description: string;
  shortDescription?: string;
  price: string | number;
  salePrice?: string | number | null;
  deliveryType?: string;
  features?: string;
  specifications?: string;
  whatsIncluded?: string;
  categories?: { id: string; name: string; slug: string }[];
  media?: { id?: string; url: string; isPrimary: boolean }[];
}

interface ProductInspectModalProps {
  product: Product | null;
  onClose: () => void;
}

export function ProductInspectModal({ product, onClose }: ProductInspectModalProps) {
  if (!product) return null;

  const featuresList = product.features
    ? product.features.split('\n').filter(Boolean)
    : ['Full commercial single-seat license', 'Complete source repository access', 'Production deployment documentation', 'Lifetime revision updates'];

  const specsList = product.specifications
    ? product.specifications.split('\n').filter(Boolean)
    : ['TypeScript 5+ Strict Mode', 'Next.js 16 App Router', 'Enterprise Clean Architecture', 'Zero-dependency design tokens'];

  const includedList = product.whatsIncluded
    ? product.whatsIncluded.split('\n').filter(Boolean)
    : ['Instant digital artifact unlock', 'Complete configuration scripts', 'Developer documentation & runbook'];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-md p-4 animate-in fade-in duration-200">
      <div 
        className="bg-card border border-border/80 w-full max-w-2xl rounded-3xl shadow-2xl p-6 sm:p-8 max-h-[90vh] overflow-y-auto space-y-6 relative text-foreground"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Bar */}
        <div className="flex items-start justify-between gap-4 border-b border-border/60 pb-5">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-primary/10 text-primary border border-primary/20 font-bold">
                {product.categories?.[0]?.name || 'Digital Engineering'}
              </span>
              <span className="text-[10px] font-mono text-foreground/50">
                [ ID: {product.slug} ]
              </span>
            </div>
            <h2 className="text-2xl font-black tracking-tight text-foreground">
              {product.title}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full border border-border flex items-center justify-center hover:bg-surface-muted text-foreground/60 hover:text-foreground text-sm cursor-pointer transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Price & Delivery Badge */}
        <div className="flex items-center justify-between bg-surface-muted/60 border border-border/60 p-4 rounded-2xl">
          <div>
            <div className="text-[10px] font-mono text-foreground/50 uppercase">Acquisition Price</div>
            <div className="mt-1">
              <PriceComponent
                price={product.salePrice || product.price}
                originalPrice={product.salePrice ? product.price : undefined}
                priceClassName="text-foreground text-2xl"
              />
            </div>
          </div>
          <div className="text-right">
            <span className="text-[10px] font-mono text-emerald-500 font-bold bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20">
              ⚡ Instant Download Token
            </span>
          </div>
        </div>

        {/* Narrative Description */}
        <div className="space-y-2">
          <h4 className="text-xs font-mono uppercase tracking-wider text-foreground/50 font-bold">
            Architectural Overview
          </h4>
          <p className="text-xs sm:text-sm text-foreground/75 leading-relaxed">
            {product.description}
          </p>
        </div>

        {/* Features & Specs Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="bg-surface-muted/30 border border-border/50 p-4 rounded-2xl space-y-2">
            <h4 className="text-xs font-mono uppercase tracking-wider text-foreground/70 font-bold flex items-center gap-1.5">
              <span>✦</span>
              <span>Core Highlights</span>
            </h4>
            <ul className="space-y-1 text-xs text-foreground/80">
              {featuresList.slice(0, 4).map((f, i) => (
                <li key={i} className="flex items-start gap-1.5">
                  <span className="text-primary font-bold">✓</span>
                  <span>{f}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="bg-surface-muted/30 border border-border/50 p-4 rounded-2xl space-y-2">
            <h4 className="text-xs font-mono uppercase tracking-wider text-foreground/70 font-bold flex items-center gap-1.5">
              <span>⚙️</span>
              <span>Engineering Stack</span>
            </h4>
            <ul className="space-y-1 text-xs text-foreground/80">
              {specsList.slice(0, 4).map((s, i) => (
                <li key={i} className="flex items-start gap-1.5">
                  <span className="text-foreground/40 font-mono">&gt;</span>
                  <span>{s}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* What's Included */}
        <div className="border-t border-border/50 pt-4 space-y-2">
          <h4 className="text-xs font-mono uppercase tracking-wider text-foreground/50 font-bold">
            Included in this License
          </h4>
          <div className="flex flex-wrap gap-2">
            {includedList.map((inc, i) => (
              <span key={i} className="text-[11px] font-medium bg-foreground/5 text-foreground/75 px-3 py-1 rounded-lg border border-border/40">
                📦 {inc}
              </span>
            ))}
          </div>
        </div>

        {/* Actions Footer */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-border/60">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-foreground/70 hover:bg-surface-muted transition-colors cursor-pointer"
          >
            Close
          </button>
          <Link
            href={`/checkout?productId=${product.id}`}
            className="px-6 py-2.5 rounded-xl bg-primary hover:bg-primary/90 text-white font-bold text-xs shadow-md shadow-primary/20 transition-all hover:scale-[1.02] cursor-pointer"
          >
            Acquire License & Token &rarr;
          </Link>
        </div>
      </div>
    </div>
  );
}
