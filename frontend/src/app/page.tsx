import { getBrandContext } from '@/features/brand/brand-context.resolver';
import { AppleHero } from '@/components/apple/apple-hero';
import { AppleBento } from '@/components/apple/apple-bento';
import { AppleMatrix } from '@/components/apple/apple-matrix';
import { AppleCta } from '@/components/apple/apple-cta';

export default async function Home() {
  const brand = await getBrandContext();

  return (
    <div className="flex flex-col flex-1">
      {/* 1. Keynote Hero */}
      <AppleHero brand={brand} />

      {/* 2. Apple Bento Domain Highlights */}
      <AppleBento />

      {/* 3. The Commerza Standard Pillars */}
      <AppleMatrix />

      {/* 4. Keynote Closing CTA */}
      <AppleCta />
    </div>
  );
}
