import { Injectable, HttpStatus, Logger } from '@nestjs/common';
import { OrderRepository } from '../../database/repositories/order.repository';
import { BrandRepository } from '../../database/repositories/brand.repository';
import { ProductRepository } from '../../database/repositories/product.repository';
import { CustomerRepository } from '../../database/repositories/customer.repository';
import { ConfigResolverService } from '../../config/resolver/config-resolver.service';
import { PaymentFactory } from '../../providers/payment/payment.factory';
import { QueueFactory } from '../../queue/queue.factory';
import { CreateOrderDto } from './dto/create-order.dto';
import { OrderQueryService } from './order-query.service';
import { EventEmitter2, OnEvent } from '@nestjs/event-emitter';
import { OrderCreatedEvent, OrderPaidEvent } from '../../common/events/domain.events';
import { BusinessException } from '../../common/exceptions/custom.exceptions';
import * as crypto from 'crypto';

@Injectable()
export class OrderCommandService {
  private readonly logger = new Logger(OrderCommandService.name);

  constructor(
    private readonly orderRepo: OrderRepository,
    private readonly brandRepo: BrandRepository,
    private readonly productRepo: ProductRepository,
    private readonly customerRepo: CustomerRepository,
    private readonly configResolver: ConfigResolverService,
    private readonly paymentFactory: PaymentFactory,
    private readonly queueFactory: QueueFactory,
    private readonly orderQuery: OrderQueryService,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  async checkout(createOrderDto: CreateOrderDto) {
    const { email, name, productId, brandId } = createOrderDto;

    const brand = await this.brandRepo.findById(brandId);
    if (!brand) {
      throw new BusinessException('Brand not found', HttpStatus.NOT_FOUND);
    }

    const product = await this.productRepo.findById(productId);
    if (!product || product.status !== 'ACTIVE') {
      throw new BusinessException('Product not found or inactive', HttpStatus.NOT_FOUND);
    }

    let customer = await this.customerRepo.findUnique(brandId, email);

    if (!customer) {
      customer = await this.customerRepo.create({
        brandId,
        email: email.toLowerCase(),
        name,
      });
    } else if (customer.status === 'SUSPENDED') {
      throw new BusinessException('Customer account is suspended', HttpStatus.FORBIDDEN);
    }

    const context = { brandId, productId };
    const limit = await this.configResolver.getNumber('download_limit', context, 5);
    const expiryHours = await this.configResolver.getNumber('link_expiry_hours', context, 24);

    const downloadToken = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + expiryHours);

    const order = await this.orderRepo.create({
      brandId,
      customerId: customer.id,
      productId,
      amountPaid: product.price,
      downloadToken,
      downloadLimit: limit,
      expiresAt,
      status: 'PENDING',
    });

    const paymentStrategy = await this.paymentFactory.getStrategy(context);
    const paymentIntent = await paymentStrategy.createPaymentIntent(
      Number(product.price),
      'USD',
      {
        orderId: order.id,
        brandId,
        productId,
        customerEmail: customer.email,
      }
    );

    this.eventEmitter.emit('order.created', new OrderCreatedEvent(order.id, brandId, productId, customer.email));

    return {
      orderId: order.id,
      amount: order.amountPaid,
      downloadToken: order.downloadToken,
      payment: paymentIntent,
    };
  }

  async fulfillOrder(orderId: string, paymentId: string) {
    const order = await this.orderQuery.findOne(orderId);
    if (order.status === 'PAID') return order;

    const updatedOrder = await this.orderRepo.update(orderId, {
      status: 'PAID',
      paymentId,
    });

    this.eventEmitter.emit('order.paid', new OrderPaidEvent(updatedOrder.id, paymentId));

    // Delegate fulfillment email sending to the background worker queue
    const queueStrategy = await this.queueFactory.getStrategy();
    await queueStrategy.enqueue('send-fulfillment-email', {
      orderId: updatedOrder.id,
      customerEmail: order.customer.email,
    });

    return updatedOrder;
  }

  async resendFulfillmentEmail(orderId: string) {
    const order = await this.orderQuery.findOne(orderId);
    if (order.status !== 'PAID') {
      throw new BusinessException('Only paid orders can have fulfillment emails resent.', HttpStatus.BAD_REQUEST);
    }

    const queueStrategy = await this.queueFactory.getStrategy();
    await queueStrategy.enqueue('send-fulfillment-email', {
      orderId: order.id,
      customerEmail: order.customer.email,
    });

    return { success: true, message: 'Fulfillment email queued for resending' };
  }

  async regenerateDownloadLink(orderId: string) {
    const order = await this.orderQuery.findOne(orderId);
    
    const context = { brandId: order.brandId, productId: order.productId };
    const expiryHours = await this.configResolver.getNumber('link_expiry_hours', context, 24);
    const limit = await this.configResolver.getNumber('download_limit', context, 5);

    const downloadToken = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + expiryHours);

    const updated = await this.orderRepo.update(orderId, {
      downloadToken,
      expiresAt,
      downloadLimit: limit,
      downloadCount: 0,
    });

    // Enqueue an email job notifying the customer about the regenerated link
    const queueStrategy = await this.queueFactory.getStrategy();
    await queueStrategy.enqueue('send-fulfillment-email', {
      orderId: updated.id,
      customerEmail: order.customer.email,
    });

    return updated;
  }

  @OnEvent('payment.received')
  async handlePaymentReceived(payload: { orderId: string; paymentId: string }) {
    this.logger.log(`Handling payment.received event for order ${payload.orderId}.`);
    try {
      await this.fulfillOrder(payload.orderId, payload.paymentId);
    } catch (err: any) {
      this.logger.error(`Fulfillment event failed for order ${payload.orderId}: ${err.message}`);
    }
  }
}
