export interface PaymentIntentResult {
  id: string;
  clientSecret: string;
  provider: string;
}

export interface WebhookResult {
  orderId: string;
  status: 'SUCCESS' | 'FAILED';
  paymentId: string;
  amount: number;
}

export interface PaymentStrategy {
  createPaymentIntent(amount: number, currency: string, metadata: Record<string, any>): Promise<PaymentIntentResult>;
  verifyWebhook(signature: string, rawBody: string): Promise<WebhookResult>;
}
