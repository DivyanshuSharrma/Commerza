import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { EmailFactory } from '../providers/email/email.factory';
import { OrderRepository } from '../database/repositories/order.repository';

@Injectable()
export class QueueProcessor {
  private readonly logger = new Logger(QueueProcessor.name);

  constructor(
    private readonly emailFactory: EmailFactory,
    private readonly orderRepo: OrderRepository,
  ) {}

  @OnEvent('job.send-fulfillment-email')
  async processEmailJob(payload: { orderId: string }) {
    this.logger.log(`[QueueProcessor] Processing email fulfillment job for order: ${payload.orderId}`);
    const order = await this.orderRepo.findById(payload.orderId);
    if (!order) return;

    const emailStrategy = await this.emailFactory.getStrategy({
      brandId: order.brandId,
      productId: order.productId,
    });

    const downloadLink = `${process.env.APP_URL || 'http://localhost:3000'}/api/v1/download/d/${order.downloadToken}`;

    const emailHtml = `
      <div style="font-family: sans-serif; padding: 24px; color: #333; max-width: 600px; margin: 0 auto; border: 1px solid #eef2f6; border-radius: 8px;">
        <h2 style="color: ${order.brand.primaryColor || '#4f46e5'};">Thank you for your purchase!</h2>
        <p>Hi ${order.customer.name || 'Valued Customer'},</p>
        <p>Your payment for <strong>${order.product.title}</strong> has been successfully verified.</p>
        
        <table style="width: 100%; border-collapse: collapse; margin: 20px 0; font-size: 14px;">
          <tr>
            <td style="padding: 8px 0; color: #666;">Order ID:</td>
            <td style="padding: 8px 0; font-weight: bold; font-family: monospace;">${order.id}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; color: #666;">Amount Paid:</td>
            <td style="padding: 8px 0; font-weight: bold;">$${order.amountPaid}</td>
          </tr>
        </table>

        <p>You can securely download your digital product using the button below:</p>
        <div style="margin: 25px 0;">
          <a href="${downloadLink}" style="background-color: ${order.brand.primaryColor || '#4f46e5'}; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">Download Product</a>
        </div>
        
        <div style="background-color: #f8fafc; border-left: 4px solid ${order.brand.primaryColor || '#4f46e5'}; padding: 12px 16px; margin: 20px 0; border-radius: 4px;">
          <h4 style="margin: 0 0 6px 0; color: #1e293b;">Important Instructions & Notes:</h4>
          <ul style="margin: 0; padding-left: 20px; font-size: 13px; color: #475569; line-height: 1.6;">
            <li>This download link is secure and unique to your order.</li>
            <li>You can download this file a maximum of <strong>${order.downloadLimit}</strong> times.</li>
            <li>The link will expire on <strong>${new Date(order.expiresAt).toLocaleDateString('en-US', { dateStyle: 'long' })}</strong>.</li>
            <li>Please do not share this link with anyone, as it tracks download attempts and logs security details.</li>
          </ul>
        </div>
        
        <p style="font-size: 12px; color: #94a3b8; margin-top: 30px;">
          If you have any questions or experience issues downloading your product, please reply to this email to contact our support team.
        </p>
      </div>
    `;

    try {
      await emailStrategy.sendEmail({
        to: order.customer.email,
        subject: `Your download is ready: ${order.product.title}`,
        html: emailHtml,
      });
      this.logger.log(`[QueueProcessor] Email sent successfully to: ${order.customer.email}`);
    } catch (err: any) {
      this.logger.error(`[QueueProcessor] Failed to send email: ${err.message}`);
    }
  }
}
