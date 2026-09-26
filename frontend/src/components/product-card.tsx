import Link from 'next/link';
import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { PriceComponent } from './price-component';

interface ProductCardProps {
  product: {
    id: string;
    title: string;
    slug: string;
    description: string;
    price: string;
    media: { id: string; url: string; isPrimary: boolean }[];
    categories: { id: string; name: string; slug: string }[];
  };
}

export function ProductCard({ product }: ProductCardProps) {
  const primaryMedia = product.media.find((m) => m.isPrimary) || product.media[0] || null;

  return (
    <Card className="flex flex-col h-full group hover:shadow-md transition-all duration-300 transform hover:-translate-y-1 bg-card">
      <Link href={`/products/${product.slug}`} className="block relative aspect-video w-full overflow-hidden bg-foreground/5 border-b border-border">
        {primaryMedia ? (
          <img
            src={primaryMedia.url}
            alt={product.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-foreground/30 font-bold select-none text-sm bg-foreground/5">
            No Image Available
          </div>
        )}
      </Link>
      <div className="p-5 flex-1 flex flex-col">
        <div className="flex flex-wrap gap-1.5 mb-2.5">
          {product.categories.map((c) => (
            <Badge key={c.id} variant="primary">
              {c.name}
            </Badge>
          ))}
        </div>
        <Link href={`/products/${product.slug}`} className="block">
          <h3 className="text-lg font-bold text-foreground hover:text-primary transition-colors line-clamp-1 mb-1.5">
            {product.title}
          </h3>
        </Link>
        <p className="text-xs text-foreground/60 line-clamp-3 mb-4 leading-relaxed flex-1">
          {product.description}
        </p>
        <div className="mt-auto pt-3 border-t border-border/60 flex items-center justify-between">
          <PriceComponent price={product.price} priceClassName="text-xl" />
          <Link
            href={`/products/${product.slug}`}
            className="inline-flex items-center justify-center rounded-lg text-xs font-semibold bg-primary text-white hover:opacity-90 active:scale-[0.98] px-4 py-2 cursor-pointer transition-all"
          >
            Buy Now
          </Link>
        </div>
      </div>
    </Card>
  );
}
