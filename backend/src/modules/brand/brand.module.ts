import { Module } from '@nestjs/common';
import { BrandQueryService } from './brand-query.service';
import { BrandCommandService } from './brand-command.service';
import { BrandController } from './brand.controller';
import { DatabaseModule } from '../../database/database.module';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [DatabaseModule, AuthModule],
  controllers: [BrandController],
  providers: [BrandQueryService, BrandCommandService],
  exports: [BrandQueryService, BrandCommandService],
})
export class BrandModule {}
