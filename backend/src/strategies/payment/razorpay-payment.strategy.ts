import { PaymentStrategy, PaymentIntentResult, WebhookResult } from '../../core/interfaces/payment-strategy.interface';
import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '../../config/config.service';
import * as crypto from 'crypto';

@Injectable()
export class RazorpayPaymentStrategy implements PaymentStrategy {
  private readonly logger = new Logger(RazorpayPaymentStrategy.name);

  constructor(private readonly configService: ConfigService) {}

  async createPaymentIntent(amount: number, currency: string, metadata: Record<string, any>): Promise<PaymentIntentResult> {
    try {
      const keyId = await this.configService.get('razorpay_key_id', { brandId: metadata.brandId });
      const keySecret = await this.configService.get('razorpay_key_secret', { brandId: metadata.brandId });
      
      const razorpayAmount = Math.round(amount * 100);

      // Create Razorpay Order via HTTP POST
      const auth = Buffer.from(`${keyId}:${keySecret}`).toString('base64');
      const response = await fetch('https://api.razorpay.com/v1/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Basic ${auth}`,
        },
        body: JSON.stringify({
          amount: razorpayAmount,
          currency: currency.toUpperCase(),
          receipt: metadata.orderId,
          notes: metadata,
        }),
      });

      if (!response.ok) {
        const errText = await response.text();
        throw new Error(`Razorpay API responded with status ${response.status}: ${errText}`);
      }

      const order = await response.json();

      return {
        id: order.id,
        clientSecret: order.id, // For Razorpay, order ID is passed to client widget
        provider: 'RAZORPAY',
      };
    } catch (err: any) {
      this.logger.error(`Razorpay createPaymentIntent failed: ${err.message}`);
      throw err;
    }
  }

  async verifyWebhook(signature: string, rawBody: string): Promise<WebhookResult> {
    try {
      const webhookSecret = await this.configService.get('razorpay_webhook_secret', {}, '');
      
      const expectedSignature = crypto
        .createHmac('sha256', webhookSecret)
        .update(rawBody)
        .digest('hex');

      if (expectedSignature !== signature) {
        throw new Error('Signature mismatch');
      }

      const payload = JSON.parse(rawBody);
      
      // Razorpay payment.captured or order.paid event
      if (payload.event === 'payment.captured' || payload.event === 'order.paid') {
        const payment = payload.payload.payment?.entity || {};
        const notes = payment.notes || {};
        return {
          orderId: notes.orderId || payload.payload.order?.entity?.receipt || '',
          status: 'SUCCESS',
          paymentId: payment.id || payload.id,
          amount: (payment.amount || 0) / 100,
        };
      }

      return {
        orderId: '',
        status: 'FAILED',
        paymentId: '',
        amount: 0,
      };
    } catch (err: any) {
      this.logger.error(`Razorpay webhook signature verification failed: ${err.message}`);
      throw err;
    }
  }
}
