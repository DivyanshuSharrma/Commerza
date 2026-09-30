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

  async findPaginated(options: {
    brandId?: string;
    categoryId?: string;
    page?: number;
    limit?: number;
    search?: string;
    status?: string;
  }) {
    const page = Math.max(1, Number(options.page) || 1);
    const limit = Math.max(1, Math.min(100, Number(options.limit) || 10));
    const skip = (page - 1) * limit;

    const where: any = {};
    if (options.brandId) {
      where.brandId = options.brandId;
    }
    if (options.status && options.status !== 'ALL') {
      where.status = options.status;
    }
    if (options.categoryId && options.categoryId !== 'ALL') {
      where.categories = { some: { id: options.categoryId } };
    }
    if (options.search && options.search.trim()) {
      const q = options.search.trim();
      where.OR = [
        { title: { contains: q } },
        { description: { contains: q } },
        { slug: { contains: q } },
      ];
    }

    const [total, items] = await Promise.all([
      this.prisma.product.count({ where }),
      this.prisma.product.findMany({
        where,
        skip,
        take: limit,
        include: { categories: true, media: { orderBy: { position: 'asc' } } },
        orderBy: { createdAt: 'desc' },
      }),
    ]);

    return {
      items,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit) || 1,
    };
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
