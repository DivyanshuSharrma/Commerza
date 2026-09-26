import { DeliveryStrategy } from '../../core/interfaces/delivery-strategy.interface';
import { Injectable, Logger } from '@nestjs/common';
import { Response } from 'express';
import { StorageFactory } from '../../providers/storage/storage.factory';
import * as path from 'path';

@Injectable()
export class InternalFileDeliveryStrategy implements DeliveryStrategy {
  private readonly logger = new Logger(InternalFileDeliveryStrategy.name);

  constructor(private readonly storageFactory: StorageFactory) {}

  async deliver(orderId: string, deliveryConfig: any, res: Response): Promise<void> {
    try {
      const filePath = deliveryConfig.filePath;
      if (!filePath) {
        throw new Error(`File path missing in product configuration for order ${orderId}`);
      }

      const storageStrategy = await this.storageFactory.getStrategy();

      if (storageStrategy.deliveryMode === 'STREAM') {
        this.logger.log(`Streaming private digital file directly for order: ${orderId}`);
        const stream = await storageStrategy.downloadStream(filePath);
        
        // Extract original file name or fallback to stored file name
        const filename = deliveryConfig.originalName || path.basename(filePath);
        const mimeType = deliveryConfig.mimeType || 'application/octet-stream';

        res.setHeader('Content-Type', mimeType);
        res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
        
        stream.pipe(res);
      } else {
        // Generate a temporary signed URL valid for 60 seconds and redirect
        this.logger.log(`Redirecting to signed storage URL for order: ${orderId}`);
        const signedUrl = await storageStrategy.getSignedUrl(filePath, 60);
        res.redirect(signedUrl);
      }
    } catch (err: any) {
      this.logger.error(`Internal file delivery failed for order ${orderId}: ${err.message}`);
      res.status(500).json({ success: false, error: 'Failed to deliver digital product file' });
    }
  }
}
