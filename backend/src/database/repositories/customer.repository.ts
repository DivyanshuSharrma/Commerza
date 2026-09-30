import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';

@Injectable()
export class CustomerRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findMany() {
    return this.prisma.customer.findMany({
      orderBy: { createdAt: 'desc' },
    });
  }

  async findPaginated(options: {
    brandId?: string;
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
    if (options.search && options.search.trim()) {
      const q = options.search.trim();
      where.OR = [
        { email: { contains: q } },
        { name: { contains: q } },
      ];
    }

    const [total, items] = await Promise.all([
      this.prisma.customer.count({ where }),
      this.prisma.customer.findMany({
        where,
        skip,
        take: limit,
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

  async findUnique(brandId: string, email: string) {
    return this.prisma.customer.findUnique({
      where: {
        brandId_email: {
          brandId,
          email: email.toLowerCase(),
        },
      },
    });
  }

  async create(data: any) {
    return this.prisma.customer.create({ data });
  }

  async update(id: string, data: { status?: 'ACTIVE' | 'SUSPENDED'; name?: string }) {
    return this.prisma.customer.update({
      where: { id },
      data,
    });
  }
}
