import { Module } from '@nestjs/common';
import { OrderQueryService } from './order-query.service';
import { OrderCommandService } from './order-command.service';
import { OrderController } from './order.controller';
import { DatabaseModule } from '../../database/database.module';
import { AuthModule } from '../auth/auth.module';
import { PaymentModule } from '../payment/payment.module';
import { NotificationModule } from '../notification/notification.module';

import { InvoicePdfService } from './invoice-pdf.service';

@Module({
  imports: [DatabaseModule, AuthModule, PaymentModule, NotificationModule],
  controllers: [OrderController],
  providers: [OrderQueryService, OrderCommandService, InvoicePdfService],
  exports: [OrderQueryService, OrderCommandService, InvoicePdfService],
})
export class OrderModule {}
