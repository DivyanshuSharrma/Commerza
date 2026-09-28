'use client';

import { useCurrency } from '@/features/currency/currency-context';

interface PriceComponentProps {
  price: string | number;
  originalPrice?: string | number;
  className?: string;
  priceClassName?: string;
}

export function PriceComponent({ price, originalPrice, className = '', priceClassName = '' }: PriceComponentProps) {
  const { formatPrice } = useCurrency();

  return (
    <div className={`flex items-baseline gap-2 ${className}`}>
      <span className={`text-2xl font-extrabold text-primary ${priceClassName}`}>
        {formatPrice(price)}
      </span>
      {originalPrice && Number(originalPrice) > Number(price) && (
        <span className="text-sm text-foreground/45 line-through font-medium">
          {formatPrice(originalPrice)}
        </span>
      )}
    </div>
  );
}
