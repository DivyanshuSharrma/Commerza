'use client';

import { useState } from 'react';
import { BrandData } from '@/features/brand/brand-context.resolver';
import { HeroSection } from './hero-section';
import { StatsBar } from './stats-bar';
import { WorksStoreSection } from './works-store-section';
import { TechStackBento } from './tech-stack-bento';
import { PhilosophySection } from './philosophy-section';
import { TestimonialsSection } from './testimonials-section';
import { FaqSection } from './faq-section';
import { HireSection } from './hire-section';
import { OrderRecoveryModal } from '../order-recovery-modal';

interface PortfolioLandingProps {
  brand: BrandData;
  products: any[];
}

export function PortfolioLanding({ brand, products }: PortfolioLandingProps) {
  const [isRecoveryOpen, setIsRecoveryOpen] = useState(false);
  const featuredProduct = products.length > 0 ? products[0] : null;

  return (
    <div className="flex flex-col flex-1 aura-mesh">
      {/* 1. Hero Showcase */}
      <HeroSection
        brand={brand}
        featuredProduct={featuredProduct}
        onOpenRecovery={() => setIsRecoveryOpen(true)}
      />

      {/* 2. Proof Metric Ticker */}
      <StatsBar stats={brand.themeSettings?.stats} />

      {/* 3. Curated Goods Catalog */}
      <WorksStoreSection products={products} brandName={brand.name} />

      {/* 4. Engineering Standards & Tech Stack Bento */}
      <TechStackBento brand={brand} />

      {/* 5. Philosophy & Craft Manifesto */}
      <PhilosophySection brand={brand} />

      {/* 6. Verified Buyer Endorsements */}
      <TestimonialsSection />

      {/* 7. Interactive FAQ */}
      <FaqSection onOpenRecovery={() => setIsRecoveryOpen(true)} />

      {/* 8. Bespoke Inquiries & Direct Contact */}
      <HireSection brand={brand} />

      {/* Order Recovery Modal */}
      <OrderRecoveryModal
        isOpen={isRecoveryOpen}
        onClose={() => setIsRecoveryOpen(false)}
        brandId={brand.id}
      />
    </div>
  );
}
