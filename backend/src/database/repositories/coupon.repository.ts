import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';

@Injectable()
export class CouponRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findMany() {
    return this.prisma.coupon.findMany({
      orderBy: { createdAt: 'desc' },
    });
  }

  async findById(id: string) {
    return this.prisma.coupon.findUnique({
      where: { id },
    });
  }

  async findByCode(code: string) {
    return this.prisma.coupon.findUnique({
      where: { code: code.toUpperCase() },
    });
  }

  async create(data: {
    code: string;
    discount: number;
    isPercent?: boolean;
    expiresAt?: Date | null;
    usageLimit?: number | null;
    active?: boolean;
  }) {
    return this.prisma.coupon.create({
      data: {
        ...data,
        code: data.code.toUpperCase(),
      },
    });
  }

  async update(id: string, data: {
    code?: string;
    discount?: number;
    isPercent?: boolean;
    expiresAt?: Date | null;
    usageLimit?: number | null;
    active?: boolean;
  }) {
    return this.prisma.coupon.update({
      where: { id },
      data: {
        ...data,
        code: data.code ? data.code.toUpperCase() : undefined,
      },
    });
  }

  async delete(id: string) {
    return this.prisma.coupon.delete({
      where: { id },
    });
  }
}
