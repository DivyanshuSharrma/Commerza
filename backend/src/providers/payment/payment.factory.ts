import { Injectable, Logger } from '@nestjs/common';
import { ConfigService, ConfigContext } from '../../config/config.service';
import { PaymentStrategy } from '../../core/interfaces/payment-strategy.interface';
import { MockPaymentStrategy } from '../../strategies/payment/mock-payment.strategy';
import { StripePaymentStrategy } from '../../strategies/payment/stripe-payment.strategy';
import { RazorpayPaymentStrategy } from '../../strategies/payment/razorpay-payment.strategy';

@Injectable()
export class PaymentFactory {
  private readonly logger = new Logger(PaymentFactory.name);

  constructor(
    private readonly configService: ConfigService,
    private readonly mockPaymentStrategy: MockPaymentStrategy,
    private readonly stripePaymentStrategy: StripePaymentStrategy,
    private readonly razorpayPaymentStrategy: RazorpayPaymentStrategy,
  ) {}

  async getStrategy(context?: ConfigContext): Promise<PaymentStrategy> {
    const provider = await this.configService.get('payment_provider', context, 'MOCK');

    switch (provider.toUpperCase()) {
      case 'STRIPE': {
        const stripeKey = await this.configService.get('stripe_secret_key', context);
        if (!stripeKey) {
          this.logger.warn(
            '[PaymentFactory] payment_provider is STRIPE, but stripe_secret_key is empty. Falling back to MOCK for localhost development.',
          );
          return this.mockPaymentStrategy;
        }
        return this.stripePaymentStrategy;
      }
      case 'RAZORPAY': {
        const rzpKey = await this.configService.get('razorpay_key_id', context);
        if (!rzpKey) {
          this.logger.warn(
            '[PaymentFactory] payment_provider is RAZORPAY, but razorpay_key_id is empty. Falling back to MOCK for localhost development.',
          );
          return this.mockPaymentStrategy;
        }
        return this.razorpayPaymentStrategy;
      }
      case 'MOCK':
      default:
        return this.mockPaymentStrategy;
    }
  }
}
