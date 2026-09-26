import { Module } from '@nestjs/common';
import { CustomerController } from './customer.controller';
import { DatabaseModule } from '../../database/database.module';

@Module({
  imports: [DatabaseModule],
  controllers: [CustomerController],
})
export class CustomerModule {}
