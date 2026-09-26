import { Module } from '@nestjs/common';
import { ProductQueryService } from './product-query.service';
import { ProductCommandService } from './product-command.service';
import { ProductSeoService } from './product-seo.service';
import { ProductController } from './product.controller';
import { DatabaseModule } from '../../database/database.module';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [DatabaseModule, AuthModule],
  controllers: [ProductController],
  providers: [ProductQueryService, ProductCommandService, ProductSeoService],
  exports: [ProductQueryService, ProductCommandService, ProductSeoService],
})
export class ProductModule {}
