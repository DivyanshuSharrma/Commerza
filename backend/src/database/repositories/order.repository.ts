import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';

@Injectable()
export class OrderRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findMany(brandId?: string) {
    return this.prisma.order.findMany({
      where: brandId ? { brandId } : undefined,
      include: { product: true, customer: true, brand: true },
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
        { id: { contains: q } },
        { customer: { email: { contains: q } } },
        { customer: { name: { contains: q } } },
        { product: { title: { contains: q } } },
      ];
    }

    const [total, items] = await Promise.all([
      this.prisma.order.count({ where }),
      this.prisma.order.findMany({
        where,
        skip,
        take: limit,
        include: { product: true, customer: true, brand: true },
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

  async findManyByCustomerEmail(email: string, brandId?: string) {
    return this.prisma.order.findMany({
      where: {
        customer: { email: email.toLowerCase() },
        ...(brandId ? { brandId } : {}),
      },
      include: { product: true, customer: true, brand: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findById(id: string) {
    return this.prisma.order.findUnique({
      where: { id },
      include: { product: true, customer: true, brand: true, downloadLogs: { orderBy: { createdAt: 'desc' } } },
    });
  }

  async findByDownloadToken(token: string) {
    return this.prisma.order.findUnique({
      where: { downloadToken: token },
      include: { product: true, customer: true, brand: true },
    });
  }

  async create(data: any) {
    return this.prisma.order.create({ data });
  }

  async update(id: string, data: any) {
    return this.prisma.order.update({
      where: { id },
      data,
      include: { product: true, customer: true, brand: true },
    });
  }

  async incrementDownloadCount(id: string) {
    return this.prisma.order.update({
      where: { id },
      data: { downloadCount: { increment: 1 } },
    });
  }

  async createDownloadLog(data: {
    orderId: string;
    ipAddress: string | null;
    userAgent: string | null;
    success: boolean;
    errorMessage: string | null;
  }) {
    return this.prisma.downloadLog.create({ data });
  }
}
