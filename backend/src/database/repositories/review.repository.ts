import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { ReviewStatus } from '@prisma/client';

export interface CreateReviewData {
  productId: string;
  brandId: string;
  authorName: string;
  authorEmail: string;
  rating: number;
  title?: string;
  comment: string;
  isVerifiedBuyer?: boolean;
  status?: ReviewStatus;
}

@Injectable()
export class ReviewRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findByProduct(productId: string, status: ReviewStatus = ReviewStatus.APPROVED) {
    return this.prisma.review.findMany({
      where: { productId, status },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findStatsByProduct(productId: string) {
    const reviews = await this.prisma.review.findMany({
      where: { productId, status: ReviewStatus.APPROVED },
      select: { rating: true },
    });

    const total = reviews.length;
    if (total === 0) {
      return {
        averageRating: 0,
        totalCount: 0,
        breakdown: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 },
      };
    }

    const sum = reviews.reduce((acc, r) => acc + r.rating, 0);
    const averageRating = Math.round((sum / total) * 10) / 10;

    const breakdown: Record<number, number> = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    for (const r of reviews) {
      if (breakdown[r.rating] !== undefined) {
        breakdown[r.rating]++;
      }
    }

    return {
      averageRating,
      totalCount: total,
      breakdown,
    };
  }

  async findManyByBrand(brandId: string) {
    return this.prisma.review.findMany({
      where: { brandId },
      include: { product: { select: { id: true, title: true, slug: true } } },
      orderBy: { createdAt: 'desc' },
    });
  }

  async create(data: CreateReviewData) {
    return this.prisma.review.create({ data });
  }

  async updateStatus(id: string, status: ReviewStatus) {
    return this.prisma.review.update({
      where: { id },
      data: { status },
    });
  }

  async delete(id: string) {
    return this.prisma.review.delete({
      where: { id },
    });
  }

  async hasCustomerPurchased(productId: string, email: string): Promise<boolean> {
    const order = await this.prisma.order.findFirst({
      where: {
        productId,
        status: 'PAID',
        customer: { email: email.toLowerCase().trim() },
      },
      select: { id: true },
    });
    return !!order;
  }
}
