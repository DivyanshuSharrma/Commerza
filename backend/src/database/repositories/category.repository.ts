import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';

@Injectable()
export class CategoryRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findMany(brandId?: string) {
    return this.prisma.category.findMany({
      where: brandId ? { brandId } : undefined,
      include: {
        _count: {
          select: { products: true },
        },
      },
      orderBy: { name: 'asc' },
    });
  }

  async findById(id: string) {
    return this.prisma.category.findUnique({
      where: { id },
      include: {
        products: {
          select: { id: true, title: true, slug: true, status: true },
        },
      },
    });
  }

  async findBySlug(brandId: string, slug: string) {
    return this.prisma.category.findUnique({
      where: {
        brandId_slug: { brandId, slug },
      },
    });
  }

  async create(data: {
    brandId: string;
    name: string;
    slug?: string;
    description?: string | null;
  }) {
    const slug = data.slug || data.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    return this.prisma.category.create({
      data: {
        brandId: data.brandId,
        name: data.name,
        slug,
        description: data.description,
      },
    });
  }

  async update(
    id: string,
    data: {
      name?: string;
      slug?: string;
      description?: string | null;
    },
  ) {
    return this.prisma.category.update({
      where: { id },
      data,
    });
  }

  async delete(id: string) {
    return this.prisma.category.delete({
      where: { id },
    });
  }
}
