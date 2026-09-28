import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  HttpStatus,
  HttpCode,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { ReviewService } from './review.service';
import { CreateReviewDto, UpdateReviewStatusDto } from './dto/create-review.dto';

@ApiTags('Reviews')
@Controller('reviews')
export class ReviewController {
  constructor(private readonly reviewService: ReviewService) {}

  @Get('product/:productId')
  @ApiOperation({ summary: 'Get approved reviews and aggregate stats for a product' })
  @ApiResponse({ status: 200, description: 'Reviews retrieved successfully' })
  async getProductReviews(@Param('productId') productId: string) {
    return this.reviewService.getProductReviews(productId);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Submit a new product review' })
  @ApiResponse({ status: 201, description: 'Review submitted successfully' })
  async createReview(@Body() dto: CreateReviewDto) {
    return this.reviewService.createReview(dto);
  }

  @Get('brand/:brandId')
  @ApiOperation({ summary: 'Get all reviews for brand moderation' })
  @ApiResponse({ status: 200, description: 'Brand reviews retrieved successfully' })
  async getBrandReviews(@Param('brandId') brandId: string) {
    return this.reviewService.getBrandReviews(brandId);
  }

  @Patch(':id/status')
  @ApiOperation({ summary: 'Update review moderation status' })
  @ApiResponse({ status: 200, description: 'Review status updated successfully' })
  async updateStatus(
    @Param('id') id: string,
    @Body() dto: UpdateReviewStatusDto,
  ) {
    return this.reviewService.updateReviewStatus(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a review' })
  @ApiResponse({ status: 200, description: 'Review deleted successfully' })
  async deleteReview(@Param('id') id: string) {
    await this.reviewService.deleteReview(id);
    return { success: true };
  }
}
