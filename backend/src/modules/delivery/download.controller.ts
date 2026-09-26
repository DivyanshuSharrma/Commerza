import { Controller, Get, Param, Req, Res, HttpStatus, Logger } from '@nestjs/common';
import * as express from 'express';
import { OrderRepository } from '../../database/repositories/order.repository';
import { DeliveryFactory } from './delivery.factory';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { BusinessException } from '../../common/exceptions/custom.exceptions';

@ApiTags('download')
@Controller('download')
export class DownloadController {
  private readonly logger = new Logger(DownloadController.name);

  constructor(
    private readonly orderRepo: OrderRepository,
    private readonly deliveryFactory: DeliveryFactory,
  ) {}

  @Get('info/:token')
  @ApiOperation({ summary: 'Retrieve download link metadata and validation state' })
  async getDownloadInfo(@Param('token') token: string) {
    const order = await this.orderRepo.findByDownloadToken(token);
    if (!order) {
      throw new BusinessException('Download link is invalid.', HttpStatus.NOT_FOUND);
    }

    const isExpired = new Date() > order.expiresAt;
    const isLimitExceeded = order.downloadCount >= order.downloadLimit;
    const isPaid = order.status === 'PAID';

    return {
      id: order.id,
      productTitle: order.product.title,
      status: order.status,
      expiresAt: order.expiresAt,
      downloadCount: order.downloadCount,
      downloadLimit: order.downloadLimit,
      isExpired,
      isLimitExceeded,
      isPaid,
    };
  }

  @Get('d/:token')
  @ApiOperation({ summary: 'Securely download product file using signed token' })
  async downloadFile(
    @Param('token') token: string,
    @Req() req: express.Request,
    @Res() res: express.Response,
  ) {
    const ipAddress = req.ip || req.socket.remoteAddress || null;
    const userAgent = req.headers['user-agent'] || null;

    // 1. Find Order
    const order = await this.orderRepo.findByDownloadToken(token);

    if (!order) {
      this.logger.warn(`Download attempt failed: token ${token} is invalid. IP: ${ipAddress}`);
      throw new BusinessException('Download link is invalid.', HttpStatus.NOT_FOUND);
    }

    // 2. Validate Order Status
    if (order.status !== 'PAID') {
      this.logger.warn(`Download attempt failed: order ${order.id} status is ${order.status}. IP: ${ipAddress}`);
      await this.logDownload(order.id, ipAddress, userAgent, false, 'Order is not paid');
      throw new BusinessException('Payment verification required for this order.', HttpStatus.PAYMENT_REQUIRED);
    }

    // 3. Validate Expiry
    if (new Date() > order.expiresAt) {
      this.logger.warn(`Download attempt failed: link expired for order ${order.id}. Expiry: ${order.expiresAt}. IP: ${ipAddress}`);
      await this.logDownload(order.id, ipAddress, userAgent, false, 'Download link expired');
      throw new BusinessException('This download link has expired.', HttpStatus.GONE);
    }

    // 4. Validate Download Limit
    if (order.downloadCount >= order.downloadLimit) {
      this.logger.warn(`Download attempt failed: limit exceeded for order ${order.id}. Count: ${order.downloadCount}/${order.downloadLimit}. IP: ${ipAddress}`);
      await this.logDownload(order.id, ipAddress, userAgent, false, 'Download limit exceeded');
      throw new BusinessException('Download limit has been exceeded for this link.', HttpStatus.FORBIDDEN);
    }

    // 5. Validate Product Status
    if (order.product.status !== 'ACTIVE') {
      this.logger.warn(`Download attempt failed: product is ${order.product.status} for order ${order.id}. IP: ${ipAddress}`);
      await this.logDownload(order.id, ipAddress, userAgent, false, 'Product is no longer active');
      throw new BusinessException('Product is currently unavailable.', HttpStatus.GONE);
    }

    // 6. Validate Customer Status
    if (order.customer.status !== 'ACTIVE') {
      this.logger.warn(`Download attempt failed: customer ${order.customer.id} is ${order.customer.status}. IP: ${ipAddress}`);
      await this.logDownload(order.id, ipAddress, userAgent, false, 'Customer account suspended');
      throw new BusinessException('Access denied.', HttpStatus.FORBIDDEN);
    }

    // 7. Increment count & log success
    await this.orderRepo.incrementDownloadCount(order.id);
    await this.logDownload(order.id, ipAddress, userAgent, true);
    
    const deliveryConfig = (order.product.deliveryConfig || {}) as Record<string, any>;
    const filePath = deliveryConfig.filePath || 'unknown';
    this.logger.log(`Download attempt succeeded: order ${order.id}, file ${filePath}, count ${order.downloadCount + 1}/${order.downloadLimit}. IP: ${ipAddress}`);

    // 8. Execute Delivery Strategy
    const deliveryStrategy = await this.deliveryFactory.getStrategy({
      brandId: order.brandId,
      productId: order.productId,
    });
    await deliveryStrategy.deliver(order.id, order.product.deliveryConfig, res);
  }

  private async logDownload(orderId: string, ip: string | null, ua: string | null, success: boolean, errMsg?: string) {
    await this.orderRepo.createDownloadLog({
      orderId,
      ipAddress: ip,
      userAgent: ua,
      success,
      errorMessage: errMsg || null,
    });
  }
}
