import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  UseGuards,
  HttpStatus,
} from '@nestjs/common';
import { CouponRepository } from '../../database/repositories/coupon.repository';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { RequirePermissions } from '../auth/permissions.decorator';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiResponse } from '@nestjs/swagger';
import { BusinessException } from '../../common/exceptions/custom.exceptions';
import { FeatureFlagsService } from '../feature-flags/feature-flags.service';

@ApiTags('coupons')
@Controller('coupons')
export class CouponController {
  constructor(
    private readonly couponRepo: CouponRepository,
    private readonly featureFlags: FeatureFlagsService,
  ) {}

  @Post('validate')
  @ApiOperation({ summary: 'Validate a coupon code publicly for checkout' })
  @ApiResponse({ status: 200, description: 'Coupon validity and discount info' })
  async validateCoupon(
    @Body('code') code: string,
    @Body('brandId') brandId?: string,
  ) {
    if (!code || !code.trim()) {
      throw new BusinessException('Coupon code is required.', HttpStatus.BAD_REQUEST);
    }

    // Verify feature flag
    const couponsEnabled = await this.featureFlags.isEnabled('coupons', brandId);
    if (!couponsEnabled) {
      throw new BusinessException('Coupons are currently disabled.', HttpStatus.FORBIDDEN);
    }

    const cleanCode = code.trim().toUpperCase();
    const coupon = await this.couponRepo.findByCode(cleanCode);

    if (!coupon || !coupon.active) {
      throw new BusinessException('Invalid or inactive coupon code.', HttpStatus.NOT_FOUND);
    }

    if (coupon.expiresAt && new Date() > new Date(coupon.expiresAt)) {
      throw new BusinessException('This coupon has expired.', HttpStatus.BAD_REQUEST);
    }

    if (coupon.usageLimit !== null && coupon.usageLimit !== undefined && coupon.usageCount >= coupon.usageLimit) {
      throw new BusinessException('Coupon usage limit reached.', HttpStatus.BAD_REQUEST);
    }

    return {
      valid: true,
      code: coupon.code,
      discount: Number(coupon.discount),
      isPercent: coupon.isPercent,
    };
  }

  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @RequirePermissions('coupon:read')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Retrieve all coupons' })
  async getCoupons() {
    const list = await this.couponRepo.findMany();
    return list;
  }

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @RequirePermissions('coupon:create')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a new coupon' })
  async createCoupon(
    @Body() body: {
      code: string;
      discount: number;
      isPercent?: boolean;
      expiresAt?: string | null;
      usageLimit?: number | null;
      active?: boolean;
    },
  ) {
    const cleanCode = body.code.trim().toUpperCase();
    const existing = await this.couponRepo.findByCode(cleanCode);
    if (existing) {
      throw new BusinessException('Coupon code already exists', HttpStatus.CONFLICT);
    }
    const coupon = await this.couponRepo.create({
      code: cleanCode,
      discount: body.discount,
      isPercent: body.isPercent,
      expiresAt: body.expiresAt ? new Date(body.expiresAt) : null,
      usageLimit: body.usageLimit,
      active: body.active,
    });
    return coupon;
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @RequirePermissions('coupon:update')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update a coupon' })
  async updateCoupon(
    @Param('id') id: string,
    @Body() body: {
      code?: string;
      discount?: number;
      isPercent?: boolean;
      expiresAt?: string | null;
      usageLimit?: number | null;
      active?: boolean;
    },
  ) {
    const coupon = await this.couponRepo.update(id, {
      code: body.code ? body.code.trim().toUpperCase() : undefined,
      discount: body.discount,
      isPercent: body.isPercent,
      expiresAt: body.expiresAt !== undefined ? (body.expiresAt ? new Date(body.expiresAt) : null) : undefined,
      usageLimit: body.usageLimit,
      active: body.active,
    });
    return coupon;
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @RequirePermissions('coupon:delete')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete a coupon' })
  async deleteCoupon(@Param('id') id: string) {
    await this.couponRepo.delete(id);
    return { message: 'Coupon deleted successfully' };
  }
}
