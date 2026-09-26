import { Injectable } from '@nestjs/common';
import { ProductQueryService } from './product-query.service';

@Injectable()
export class ProductSeoService {
  constructor(private readonly productQuery: ProductQueryService) {}

  async generateMetadata(productId: string) {
    const product = await this.productQuery.findOne(productId);

    const title = product.seoTitle || product.title;
    const description = product.seoDescription || product.description.substring(0, 160);
    const keywords = product.seoKeywords || `${product.title}, digital purchase, download`;
    const ogImage = product.seoOgImage || '';

    return {
      title,
      description,
      keywords,
      openGraph: {
        title,
        description,
        images: ogImage ? [{ url: ogImage }] : [],
        type: 'books.book',
      },
      twitter: {
        card: 'summary_large_image',
        title,
        description,
        images: ogImage ? [ogImage] : [],
      },
      jsonLd: {
        '@context': 'https://schema.org',
        '@type': 'Product',
        name: product.title,
        description: product.description.substring(0, 160),
        offers: {
          '@type': 'Offer',
          price: product.price.toString(),
          priceCurrency: 'USD',
          availability: 'https://schema.org/InStock',
        },
      },
    };
  }
}
