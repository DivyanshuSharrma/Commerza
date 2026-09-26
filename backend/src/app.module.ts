import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';

// Commerza Core & Business Modules
import { DatabaseModule } from './database/database.module';
import { ConfigModule } from './config/config.module';
import { CacheModule } from './cache/cache.module';
import { QueueModule } from './queue/queue.module';
import { FeatureFlagsModule } from './modules/feature-flags/feature-flags.module';
import { HealthModule } from './health/health.module';
import { AuthModule } from './modules/auth/auth.module';
import { BrandModule } from './modules/brand/brand.module';
import { SettingsModule } from './modules/settings/settings.module';
import { ProductModule } from './modules/product/product.module';
import { OrderModule } from './modules/order/order.module';
import { StorageModule } from './modules/storage/storage.module';
import { PaymentModule } from './modules/payment/payment.module';
import { NotificationModule } from './modules/notification/notification.module';
import { DeliveryModule } from './modules/delivery/delivery.module';
import { CustomerModule } from './modules/customer/customer.module';
import { CouponModule } from './modules/coupon/coupon.module';
import { AuditModule } from './modules/audit/audit.module';

@Module({
  imports: [
    EventEmitterModule.forRoot(),
    ThrottlerModule.forRoot([{
      ttl: 60000,
      limit: 100,
    }]),
    DatabaseModule,
    ConfigModule,
    CacheModule,
    QueueModule,
    FeatureFlagsModule,
    HealthModule,
    AuthModule,
    BrandModule,
    SettingsModule,
    ProductModule,
    OrderModule,
    StorageModule,
    PaymentModule,
    NotificationModule,
    DeliveryModule,
    CustomerModule,
    CouponModule,
    AuditModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule {}
