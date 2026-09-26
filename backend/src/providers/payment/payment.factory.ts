import { Injectable } from '@nestjs/common';
import { ConfigService, ConfigContext } from '../../config/config.service';
import { PaymentStrategy } from '../../core/interfaces/payment-strategy.interface';
import { MockPaymentStrategy } from '../../strategies/payment/mock-payment.strategy';
import { StripePaymentStrategy } from '../../strategies/payment/stripe-payment.strategy';
import { RazorpayPaymentStrategy } from '../../strategies/payment/razorpay-payment.strategy';

@Injectable()
export class PaymentFactory {
  constructor(
    private readonly configService: ConfigService,
    private readonly mockPaymentStrategy: MockPaymentStrategy,
    private readonly stripePaymentStrategy: StripePaymentStrategy,
    private readonly razorpayPaymentStrategy: RazorpayPaymentStrategy,
  ) {}

  async getStrategy(context?: ConfigContext): Promise<PaymentStrategy> {
    const provider = await this.configService.get('payment_provider', context, 'MOCK');
    
    switch (provider.toUpperCase()) {
      case 'STRIPE':
        return this.stripePaymentStrategy;
      case 'RAZORPAY':
        return this.razorpayPaymentStrategy;
      case 'MOCK':
      default:
        return this.mockPaymentStrategy;
    }
  }
}
