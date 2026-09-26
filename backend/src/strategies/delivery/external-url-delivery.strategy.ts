import { DeliveryStrategy } from '../../core/interfaces/delivery-strategy.interface';
import { Injectable, Logger } from '@nestjs/common';
import { Response } from 'express';

@Injectable()
export class ExternalUrlDeliveryStrategy implements DeliveryStrategy {
  private readonly logger = new Logger(ExternalUrlDeliveryStrategy.name);

  async deliver(orderId: string, deliveryConfig: any, res: Response): Promise<void> {
    try {
      const url = deliveryConfig.url;
      if (!url) {
        throw new Error(`External URL missing in product configuration for order ${orderId}`);
      }

      res.redirect(url);
    } catch (err: any) {
      this.logger.error(`External URL delivery failed for order ${orderId}: ${err.message}`);
      res.status(500).json({ success: false, error: 'Failed to redirect to external link' });
    }
  }
}
