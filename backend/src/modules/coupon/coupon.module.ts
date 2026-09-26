import { Module } from '@nestjs/common';
import { CouponController } from './coupon.controller';
import { DatabaseModule } from '../../database/database.module';

@Module({
  imports: [DatabaseModule],
  controllers: [CouponController],
})
export class CouponModule {}
