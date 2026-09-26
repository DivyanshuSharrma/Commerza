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
import { CouponRepository } from '../../database/repositories/coupon.repository';
import { FeatureFlagsService } from '../feature-flags/feature-flags.service';
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
    private readonly couponRepo: CouponRepository,
    private readonly featureFlags: FeatureFlagsService,
  ) {}

  async checkout(createOrderDto: CreateOrderDto) {
    const { email, name, productId, brandId, couponCode } = createOrderDto;

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
    const currency = await this.configResolver.get('store_currency', context, 'USD');

    // 1. Calculate Base Price (support salePrice discount)
    const basePrice = Number(product.salePrice !== null && product.salePrice !== undefined ? product.salePrice : product.price);
    let finalAmount = basePrice;
    let appliedCouponId: string | null = null;

    // 2. Validate and apply coupon if provided
    if (couponCode && couponCode.trim()) {
      const couponsEnabled = await this.featureFlags.isEnabled('coupons', brandId);
      if (!couponsEnabled) {
        throw new BusinessException('Coupons are currently disabled by store policy.', HttpStatus.FORBIDDEN);
      }

      const cleanCode = couponCode.trim().toUpperCase();
      const coupon = await this.couponRepo.findByCode(cleanCode);

      if (!coupon || !coupon.active) {
        throw new BusinessException('Invalid or inactive coupon code.', HttpStatus.BAD_REQUEST);
      }

      if (coupon.expiresAt && new Date() > new Date(coupon.expiresAt)) {
        throw new BusinessException('This coupon code has expired.', HttpStatus.BAD_REQUEST);
      }

      if (coupon.usageLimit !== null && coupon.usageLimit !== undefined && coupon.usageCount >= coupon.usageLimit) {
        throw new BusinessException('This coupon usage limit has been reached.', HttpStatus.BAD_REQUEST);
      }

      const discountValue = Number(coupon.discount);
      if (coupon.isPercent) {
        const discountAmount = (basePrice * discountValue) / 100;
        finalAmount = Math.max(0, basePrice - discountAmount);
      } else {
        finalAmount = Math.max(0, basePrice - discountValue);
      }

      appliedCouponId = coupon.id;
    }

    const downloadToken = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + expiryHours);

    const order = await this.orderRepo.create({
      brandId,
      customerId: customer.id,
      productId,
      amountPaid: finalAmount,
      downloadToken,
      downloadLimit: limit,
      expiresAt,
      status: 'PENDING',
    });

    // Atomically increment coupon usage after order creation
    if (appliedCouponId) {
      await this.couponRepo.incrementUsage(appliedCouponId);
    }

    const paymentStrategy = await this.paymentFactory.getStrategy(context);
    const paymentIntent = await paymentStrategy.createPaymentIntent(
      finalAmount,
      currency,
      {
        orderId: order.id,
        brandId,
        productId,
        customerEmail: customer.email,
        currency,
      }
    );

    this.eventEmitter.emit('order.created', new OrderCreatedEvent(order.id, brandId, productId, customer.email));

    return {
      orderId: order.id,
      amount: order.amountPaid,
      currency,
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

  async recoverOrdersByEmail(email: string, brandId?: string) {
    const orders = await this.orderRepo.findManyByCustomerEmail(email, brandId);
    const paidOrders = orders.filter((o: any) => o.status === 'PAID');

    if (paidOrders.length === 0) {
      return {
        success: true,
        count: 0,
        message: 'No completed orders found for this email address.',
      };
    }

    const queueStrategy = await this.queueFactory.getStrategy();
    for (const order of paidOrders) {
      await queueStrategy.enqueue('send-fulfillment-email', {
        orderId: order.id,
        customerEmail: order.customer.email,
      });
    }

    return {
      success: true,
      count: paidOrders.length,
      message: `Recovery fulfillment details sent to ${email} for ${paidOrders.length} order(s).`,
    };
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
