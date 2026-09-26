import { Controller, Post, Req, Res, Headers, HttpStatus, Logger } from '@nestjs/common';
import * as express from 'express';
import { PaymentFactory } from '../../providers/payment/payment.factory';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { ApiTags, ApiOperation } from '@nestjs/swagger';

@ApiTags('payments')
@Controller('payments')
export class PaymentController {
  private readonly logger = new Logger(PaymentController.name);

  constructor(
    private readonly paymentFactory: PaymentFactory,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  @Post('webhook')
  @ApiOperation({ summary: 'Stripe or Razorpay payment webhook handler' })
  async handleWebhook(
    @Req() req: express.Request,
    @Res() res: express.Response,
    @Headers('stripe-signature') stripeSignature?: string,
    @Headers('x-razorpay-signature') razorpaySignature?: string,
  ) {
    let signature = '';
    let provider = 'MOCK';

    if (stripeSignature) {
      signature = stripeSignature;
      provider = 'STRIPE';
    } else if (razorpaySignature) {
      signature = razorpaySignature;
      provider = 'RAZORPAY';
    } else {
      this.logger.warn('Webhook request received without valid payment provider signatures.');
      return res.status(HttpStatus.BAD_REQUEST).json({ error: 'Missing payment signature header' });
    }

    try {
      const rawBody = (req as any).rawBody ? (req as any).rawBody.toString('utf8') : '';

      if (!rawBody) {
        this.logger.error('Failed to retrieve raw body for webhook verification.');
        return res.status(HttpStatus.BAD_REQUEST).json({ error: 'Raw body is missing' });
      }

      const paymentStrategy = await this.paymentFactory.getStrategy();
      const result = await paymentStrategy.verifyWebhook(signature, rawBody);

      if (result.status === 'SUCCESS' && result.orderId) {
        this.logger.log(`Payment succeeded for order ${result.orderId} via ${provider}. Emitting event.`);
        this.eventEmitter.emit('payment.received', {
          orderId: result.orderId,
          paymentId: result.paymentId,
        });
        return res.status(HttpStatus.OK).json({ received: true, queued: true });
      } else {
        this.logger.log(`Webhook received but did not result in success status. Status: ${result.status}`);
        return res.status(HttpStatus.OK).json({ received: true, queued: false });
      }
    } catch (err: any) {
      this.logger.error(`Webhook handling failed: ${err.message}`);
      return res.status(HttpStatus.BAD_REQUEST).json({ error: `Webhook error: ${err.message}` });
    }
  }
}
