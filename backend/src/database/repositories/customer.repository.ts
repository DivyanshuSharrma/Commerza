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
