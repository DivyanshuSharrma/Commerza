import { Global, Module } from '@nestjs/common';
import { MockPaymentStrategy } from '../../strategies/payment/mock-payment.strategy';
import { StripePaymentStrategy } from '../../strategies/payment/stripe-payment.strategy';
import { RazorpayPaymentStrategy } from '../../strategies/payment/razorpay-payment.strategy';
import { PaymentFactory } from '../../providers/payment/payment.factory';
import { PaymentController } from './payment.controller';

@Global()
@Module({
  controllers: [PaymentController],
  providers: [
    MockPaymentStrategy,
    StripePaymentStrategy,
    RazorpayPaymentStrategy,
    PaymentFactory,
  ],
  exports: [
    PaymentFactory,
  ],
})
export class PaymentModule {}
