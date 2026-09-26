import { Controller, Get, Post, Patch, Delete, Param, Body, UseGuards, HttpStatus } from '@nestjs/common';
import { CouponRepository } from '../../database/repositories/coupon.repository';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { RequirePermissions } from '../auth/permissions.decorator';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { BusinessException } from '../../common/exceptions/custom.exceptions';

@ApiTags('coupons')
@Controller('coupons')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class CouponController {
  constructor(private readonly couponRepo: CouponRepository) {}

  @Get()
  @RequirePermissions('coupon:read')
  @ApiOperation({ summary: 'Retrieve all coupons' })
  async getCoupons() {
    const list = await this.couponRepo.findMany();
    return list;
  }

  @Post()
  @RequirePermissions('coupon:create')
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
    const existing = await this.couponRepo.findByCode(body.code);
    if (existing) {
      throw new BusinessException('Coupon code already exists', HttpStatus.CONFLICT);
    }
    const coupon = await this.couponRepo.create({
      code: body.code,
      discount: body.discount,
      isPercent: body.isPercent,
      expiresAt: body.expiresAt ? new Date(body.expiresAt) : null,
      usageLimit: body.usageLimit,
      active: body.active,
    });
    return coupon;
  }

  @Patch(':id')
  @RequirePermissions('coupon:update')
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
      code: body.code,
      discount: body.discount,
      isPercent: body.isPercent,
      expiresAt: body.expiresAt !== undefined ? (body.expiresAt ? new Date(body.expiresAt) : null) : undefined,
      usageLimit: body.usageLimit,
      active: body.active,
    });
    return coupon;
  }

  @Delete(':id')
  @RequirePermissions('coupon:delete')
  @ApiOperation({ summary: 'Delete a coupon' })
  async deleteCoupon(@Param('id') id: string) {
    await this.couponRepo.delete(id);
    return { message: 'Coupon deleted successfully' };
  }
}
