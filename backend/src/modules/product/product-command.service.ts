import { Injectable } from '@nestjs/common';
import { ProductRepository } from '../../database/repositories/product.repository';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { ProductQueryService } from './product-query.service';
import { SlugValidator, PricingValidator, SeoValidator } from '../../common/validators/business.validators';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { ProductCreatedEvent, ProductUpdatedEvent } from '../../common/events/domain.events';

@Injectable()
export class ProductCommandService {
  constructor(
    private readonly productRepo: ProductRepository,
    private readonly productQuery: ProductQueryService,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  async create(createProductDto: CreateProductDto) {
    const slug = createProductDto.slug || this.slugify(createProductDto.title);

    // Run custom domain validators
    SlugValidator.validate(slug);
    PricingValidator.validate(createProductDto.price);
    SeoValidator.validate(createProductDto.seoTitle || undefined, createProductDto.seoDescription || undefined);

    const product = await this.productRepo.create({
      brandId: createProductDto.brandId,
      title: createProductDto.title,
      slug,
      description: createProductDto.description,
      shortDescription: createProductDto.shortDescription,
      price: createProductDto.price,
      salePrice: createProductDto.salePrice,
      features: createProductDto.features,
      specifications: createProductDto.specifications,
      whatsIncluded: createProductDto.whatsIncluded,
      deliveryType: createProductDto.deliveryType,
      deliveryConfig: createProductDto.deliveryConfig || {},
      seoTitle: createProductDto.seoTitle,
      seoDescription: createProductDto.seoDescription,
      seoKeywords: createProductDto.seoKeywords,
      seoOgImage: createProductDto.seoOgImage,
      categories: createProductDto.categoryIds ? {
        connect: createProductDto.categoryIds.map(id => ({ id })),
      } : undefined,
      media: createProductDto.media ? {
        create: createProductDto.media.map((m, idx) => ({
          url: m.url,
          isPrimary: m.isPrimary || false,
          position: m.position !== undefined ? m.position : idx,
        })),
      } : undefined,
    });

    this.eventEmitter.emit('product.created', new ProductCreatedEvent(product.id, product.brandId, product.title));
    return product;
  }

  async update(id: string, updateProductDto: UpdateProductDto) {
    const product = await this.productQuery.findOne(id);
    const slug = updateProductDto.slug || (updateProductDto.title ? this.slugify(updateProductDto.title) : product.slug);

    // Run custom domain validators
    SlugValidator.validate(slug);
    if (updateProductDto.price !== undefined) {
      PricingValidator.validate(updateProductDto.price);
    }
    SeoValidator.validate(updateProductDto.seoTitle || undefined, updateProductDto.seoDescription || undefined);

    const updated = await this.productRepo.update(id, {
      title: updateProductDto.title,
      slug,
      description: updateProductDto.description,
      shortDescription: updateProductDto.shortDescription,
      price: updateProductDto.price,
      salePrice: updateProductDto.salePrice,
      features: updateProductDto.features,
      specifications: updateProductDto.specifications,
      whatsIncluded: updateProductDto.whatsIncluded,
      status: updateProductDto.status,
      deliveryType: updateProductDto.deliveryType,
      deliveryConfig: updateProductDto.deliveryConfig,
      seoTitle: updateProductDto.seoTitle,
      seoDescription: updateProductDto.seoDescription,
      seoKeywords: updateProductDto.seoKeywords,
      seoOgImage: updateProductDto.seoOgImage,
      categories: updateProductDto.categoryIds ? {
        set: updateProductDto.categoryIds.map(id => ({ id })),
      } : undefined,
      media: updateProductDto.media ? {
        create: updateProductDto.media.map((m, idx) => ({
          url: m.url,
          isPrimary: m.isPrimary || false,
          position: m.position !== undefined ? m.position : idx,
        })),
      } : undefined,
    });

    this.eventEmitter.emit('product.updated', new ProductUpdatedEvent(updated.id, updated.title));
    return updated;
  }

  async remove(id: string) {
    await this.productQuery.findOne(id);
    return this.productRepo.delete(id);
  }

  private slugify(text: string): string {
    return text
      .toString()
      .toLowerCase()
      .trim()
      .replace(/\s+/g, '-')
      .replace(/[^\w\-]+/g, '')
      .replace(/\-\-+/g, '-');
  }
}
