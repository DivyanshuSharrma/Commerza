import { PaymentStrategy, PaymentIntentResult, WebhookResult } from '../../core/interfaces/payment-strategy.interface';
import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '../../config/config.service';
import Stripe from 'stripe';

@Injectable()
export class StripePaymentStrategy implements PaymentStrategy {
  private readonly logger = new Logger(StripePaymentStrategy.name);

  constructor(private readonly configService: ConfigService) {}

  private async getStripeClient(context?: any): Promise<{ stripe: Stripe; webhookSecret: string }> {
    const secretKey = await this.configService.get('stripe_secret_key', context);
    const webhookSecret = await this.configService.get('stripe_webhook_secret', context, '');
    
    const stripe = new Stripe(secretKey, {
      apiVersion: '2025-01-27' as any,
    });

    return { stripe, webhookSecret };
  }

  async createPaymentIntent(amount: number, currency: string, metadata: Record<string, any>): Promise<PaymentIntentResult> {
    try {
      const { stripe } = await this.getStripeClient({ brandId: metadata.brandId });
      const stripeAmount = Math.round(amount * 100);

      const intent = await stripe.paymentIntents.create({
        amount: stripeAmount,
        currency: currency.toLowerCase(),
        metadata,
        automatic_payment_methods: {
          enabled: true,
        },
      });

      return {
        id: intent.id,
        clientSecret: intent.client_secret || '',
        provider: 'STRIPE',
      };
    } catch (err: any) {
      this.logger.error(`Stripe createPaymentIntent failed: ${err.message}`);
      throw err;
    }
  }

  async verifyWebhook(signature: string, rawBody: string): Promise<WebhookResult> {
    try {
      const { stripe, webhookSecret } = await this.getStripeClient();
      
      const event = stripe.webhooks.constructEvent(
        rawBody,
        signature,
        webhookSecret
      );

      if (event.type === 'payment_intent.succeeded') {
        const intent = event.data.object as Stripe.PaymentIntent;
        return {
          orderId: intent.metadata.orderId || '',
          status: 'SUCCESS',
          paymentId: intent.id,
          amount: intent.amount / 100,
        };
      }

      return {
        orderId: '',
        status: 'FAILED',
        paymentId: '',
        amount: 0,
      };
    } catch (err: any) {
      this.logger.error(`Stripe webhook signature verification failed: ${err.message}`);
      throw err;
    }
  }
}
