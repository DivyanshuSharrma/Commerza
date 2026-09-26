import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';

@Injectable()
export class ProductRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findMany(brandId?: string) {
    return this.prisma.product.findMany({
      where: brandId ? { brandId } : undefined,
      include: { categories: true, media: { orderBy: { position: 'asc' } } },
    });
  }

  async findById(id: string) {
    return this.prisma.product.findUnique({
      where: { id },
      include: { categories: true, media: { orderBy: { position: 'asc' } } },
    });
  }

  async findBySlug(brandId: string, slug: string) {
    return this.prisma.product.findUnique({
      where: {
        brandId_slug: {
          brandId,
          slug: slug.toLowerCase(),
        },
      },
      include: { categories: true, media: { orderBy: { position: 'asc' } } },
    });
  }

  async create(data: any) {
    return this.prisma.product.create({ data });
  }

  async update(id: string, data: any) {
    if (data.media) {
      await this.prisma.productMedia.deleteMany({ where: { productId: id } });
    }
    return this.prisma.product.update({ where: { id }, data });
  }

  async delete(id: string) {
    return this.prisma.product.delete({ where: { id } });
  }
}
