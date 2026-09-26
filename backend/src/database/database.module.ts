import { Module } from '@nestjs/common';
import { PrismaService } from './prisma.service';
import { BrandRepository } from './repositories/brand.repository';
import { ProductRepository } from './repositories/product.repository';
import { OrderRepository } from './repositories/order.repository';
import { CustomerRepository } from './repositories/customer.repository';
import { SettingRepository } from './repositories/setting.repository';
import { UserRepository } from './repositories/user.repository';
import { RoleRepository } from './repositories/role.repository';
import { CouponRepository } from './repositories/coupon.repository';
import { AuditLogRepository } from './repositories/audit-log.repository';
import { CategoryRepository } from './repositories/category.repository';
import { TransactionService } from './transaction.service';

@Module({
  providers: [
    PrismaService,
    BrandRepository,
    ProductRepository,
    OrderRepository,
    CustomerRepository,
    SettingRepository,
    UserRepository,
    RoleRepository,
    CouponRepository,
    AuditLogRepository,
    CategoryRepository,
    TransactionService,
  ],
  exports: [
    PrismaService,
    BrandRepository,
    ProductRepository,
    OrderRepository,
    CustomerRepository,
    SettingRepository,
    UserRepository,
    RoleRepository,
    CouponRepository,
    AuditLogRepository,
    CategoryRepository,
    TransactionService,
  ],
})
export class DatabaseModule {}
