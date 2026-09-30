import { Injectable, HttpStatus } from '@nestjs/common';
import { ProductRepository } from '../../database/repositories/product.repository';
import { BusinessException } from '../../common/exceptions/custom.exceptions';

@Injectable()
export class ProductQueryService {
  constructor(private readonly productRepo: ProductRepository) {}

  async findAll(brandId?: string) {
    return this.productRepo.findMany(brandId);
  }

  async findPaginated(options: {
    brandId?: string;
    categoryId?: string;
    page?: number;
    limit?: number;
    search?: string;
    status?: string;
  }) {
    return this.productRepo.findPaginated(options);
  }

  async findOne(id: string) {
    const product = await this.productRepo.findById(id);
    if (!product) throw new BusinessException('Product not found', HttpStatus.NOT_FOUND);
    return product;
  }

  async findBySlug(brandId: string, slug: string) {
    const product = await this.productRepo.findBySlug(brandId, slug);
    if (!product) throw new BusinessException(`Product with slug '${slug}' not found`, HttpStatus.NOT_FOUND);
    return product;
  }
}
