import { PaymentStrategy, PaymentIntentResult, WebhookResult } from '../../core/interfaces/payment-strategy.interface';
import { Injectable } from '@nestjs/common';

@Injectable()
export class MockPaymentStrategy implements PaymentStrategy {
  async createPaymentIntent(amount: number, currency: string, metadata: Record<string, any>): Promise<PaymentIntentResult> {
    return {
      id: `mock_pi_${Date.now()}`,
      clientSecret: `mock_secret_${Date.now()}`,
      provider: 'MOCK',
    };
  }

  async verifyWebhook(signature: string, rawBody: string): Promise<WebhookResult> {
    const payload = JSON.parse(rawBody);
    return {
      orderId: payload.orderId || 'mock-order-id',
      status: 'SUCCESS',
      paymentId: `mock_pay_${Date.now()}`,
      amount: payload.amount || 0,
    };
  }
}
