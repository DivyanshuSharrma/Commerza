import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { DatabaseModule } from '../../database/database.module';
import { ConfigModule } from '../../config/config.module';
import { CustomerPortalController } from './customer-portal.controller';
import { CustomerPortalService } from './customer-portal.service';
import { CustomerJwtAuthGuard } from './guards/customer-jwt-auth.guard';

@Module({
  imports: [
    DatabaseModule,
    ConfigModule,
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'commerza-super-secret-key-change-this-in-production',
      signOptions: { expiresIn: (process.env.JWT_EXPIRY || '7d') as any },
    }),
  ],
  controllers: [CustomerPortalController],
  providers: [CustomerPortalService, CustomerJwtAuthGuard],
  exports: [CustomerPortalService, CustomerJwtAuthGuard],
})
export class CustomerPortalModule {}
