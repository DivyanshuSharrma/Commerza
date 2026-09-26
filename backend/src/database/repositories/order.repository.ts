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
