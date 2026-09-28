import { Injectable, NotFoundException } from '@nestjs/common';
import { ReviewRepository } from '../../database/repositories/review.repository';
import { ProductRepository } from '../../database/repositories/product.repository';
import { CreateReviewDto, UpdateReviewStatusDto } from './dto/create-review.dto';
import { ReviewStatus } from '@prisma/client';

@Injectable()
export class ReviewService {
  constructor(
    private readonly reviewRepo: ReviewRepository,
    private readonly productRepo: ProductRepository,
  ) {}

  async getProductReviews(productId: string) {
    const product = await this.productRepo.findById(productId);
    if (!product) {
      throw new NotFoundException('Product not found.');
    }

    const [reviews, stats] = await Promise.all([
      this.reviewRepo.findByProduct(productId, ReviewStatus.APPROVED),
      this.reviewRepo.findStatsByProduct(productId),
    ]);

    return {
      stats,
      reviews,
    };
  }

  async createReview(dto: CreateReviewDto) {
    const product = await this.productRepo.findById(dto.productId);
    if (!product) {
      throw new NotFoundException('Product not found.');
    }

    // Auto-verify if this authorEmail has purchased this product
    const isVerifiedBuyer = await this.reviewRepo.hasCustomerPurchased(
      dto.productId,
      dto.authorEmail,
    );

    const review = await this.reviewRepo.create({
      productId: dto.productId,
      brandId: dto.brandId,
      authorName: dto.authorName.trim(),
      authorEmail: dto.authorEmail.toLowerCase().trim(),
      rating: dto.rating,
      title: dto.title?.trim(),
      comment: dto.comment.trim(),
      isVerifiedBuyer,
      status: ReviewStatus.APPROVED,
    });

    return review;
  }

  async getBrandReviews(brandId: string) {
    return this.reviewRepo.findManyByBrand(brandId);
  }

  async updateReviewStatus(id: string, dto: UpdateReviewStatusDto) {
    return this.reviewRepo.updateStatus(id, dto.status as ReviewStatus);
  }

  async deleteReview(id: string) {
    return this.reviewRepo.delete(id);
  }
}
