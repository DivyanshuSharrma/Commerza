import {
  Injectable,
  Logger,
  UnauthorizedException,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../../database/prisma.service';
import { EmailFactory } from '../../providers/email/email.factory';
import { RequestCustomerOtpDto } from './dto/request-otp.dto';
import { VerifyCustomerOtpDto } from './dto/verify-otp.dto';
import * as crypto from 'crypto';

@Injectable()
export class CustomerPortalService {
  private readonly logger = new Logger(CustomerPortalService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly emailFactory: EmailFactory,
  ) {}

  /**
   * Dispatches a 6-digit OTP and 1-click magic link to the customer's purchase email.
   */
  async requestOtp(dto: RequestCustomerOtpDto) {
    const cleanEmail = dto.email.trim().toLowerCase();

    // Verify whether any customer with paid orders exists for this email
    const customer = await this.prisma.customer.findFirst({
      where: {
        email: cleanEmail,
        orders: { some: { status: 'PAID' } },
      },
      include: { brand: true },
    });

    // Uniform response to prevent account enumeration
    if (!customer) {
      return {
        message: 'If an account with past orders exists for this email, a verification link has been sent.',
      };
    }

    if (customer.status === 'SUSPENDED') {
      throw new ForbiddenException('This customer account is currently suspended.');
    }

    // Generate secure 6-digit code and 32-byte cryptographic token
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

    // Invalidate prior pending tokens for this email
    await this.prisma.customerAuthToken.deleteMany({
      where: { email: cleanEmail },
    });

    // Save token record
    await this.prisma.customerAuthToken.create({
      data: {
        email: cleanEmail,
        code,
        token,
        expiresAt,
      },
    });

    const appUrl = process.env.APP_URL || 'http://localhost:3000';
    const magicLink = `${appUrl}/my-orders?token=${token}&email=${encodeURIComponent(cleanEmail)}`;
    const brandName = customer.brand?.name || 'Commerza';

    this.logger.log(`Customer OTP generated for ${cleanEmail}: ${code} (Magic Link: ${magicLink})`);

    // Dispatch email
    try {
      const emailStrategy = await this.emailFactory.getStrategy({ brandId: customer.brandId });
      await emailStrategy.sendEmail({
        to: cleanEmail,
        subject: `Your ${brandName} Customer Access Code: ${code}`,
        html: `
          <div style="font-family: sans-serif; max-width: 560px; margin: 0 auto; padding: 24px; border: 1px solid #e2e8f0; border-radius: 12px; background: #ffffff;">
            <h2 style="font-size: 20px; font-weight: 800; color: #0f172a; margin-top: 0;">Access Your Digital Products</h2>
            <p style="font-size: 14px; color: #475569; line-height: 1.6;">Use the verification code below to log into your ${brandName} customer vault:</p>
            <div style="background: #f1f5f9; border-radius: 8px; padding: 18px; text-align: center; margin: 20px 0;">
              <span style="font-size: 32px; font-family: monospace; font-weight: 900; letter-spacing: 6px; color: #0f172a;">${code}</span>
            </div>
            <p style="font-size: 13px; color: #475569; text-align: center;">Or click the one-click magic link below to sign in instantly:</p>
            <div style="text-align: center; margin: 16px 0;">
              <a href="${magicLink}" style="background-color: #0f172a; color: #ffffff; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-size: 13px; font-weight: bold; display: inline-block;">Open My Digital Vault</a>
            </div>
            <p style="font-size: 11px; color: #94a3b8; text-align: center; margin-top: 24px;">This code expires in 15 minutes. If you did not request this, you can safely ignore this email.</p>
          </div>
        `,
      });
    } catch (err: any) {
      this.logger.error(`Failed to send customer OTP email: ${err.message}`);
    }

    return {
      message: 'If an account with past orders exists for this email, a verification link has been sent.',
    };
  }

  /**
   * Verifies the customer OTP code or magic link token and issues a 7-day scoped customer JWT.
   */
  async verifyOtp(dto: VerifyCustomerOtpDto) {
    const cleanEmail = dto.email.trim().toLowerCase();

    let tokenRecord = null;

    if (dto.token && dto.token.trim()) {
      tokenRecord = await this.prisma.customerAuthToken.findFirst({
        where: {
          token: dto.token.trim(),
          email: cleanEmail,
          expiresAt: { gt: new Date() },
        },
      });
    } else if (dto.code && dto.code.trim()) {
      tokenRecord = await this.prisma.customerAuthToken.findFirst({
        where: {
          code: dto.code.trim(),
          email: cleanEmail,
          expiresAt: { gt: new Date() },
        },
      });
    }

    if (!tokenRecord) {
      throw new UnauthorizedException('Invalid or expired verification code / magic link.');
    }

    // Invalidate consumed token
    await this.prisma.customerAuthToken.delete({
      where: { id: tokenRecord.id },
    });

    const customer = await this.prisma.customer.findFirst({
      where: { email: cleanEmail },
    });

    if (!customer) {
      throw new NotFoundException('Customer profile not found.');
    }

    if (customer.status === 'SUSPENDED') {
      throw new ForbiddenException('This customer account is currently suspended.');
    }

    const accessToken = this.jwtService.sign(
      {
        sub: customer.id,
        email: customer.email,
        type: 'CUSTOMER',
      },
      {
        secret: process.env.JWT_SECRET || 'commerza-super-secret-key-change-this-in-production',
        expiresIn: '7d',
      },
    );

    return {
      accessToken,
      customer: {
        id: customer.id,
        email: customer.email,
        name: customer.name,
      },
    };
  }

  /**
   * Retrieves all settled, paid digital product orders for the authenticated customer.
   */
  async getCustomerOrders(customerEmail: string) {
    const cleanEmail = customerEmail.trim().toLowerCase();

    const orders = await this.prisma.order.findMany({
      where: {
        customer: { email: cleanEmail },
        status: 'PAID',
      },
      include: {
        product: {
          include: {
            media: true,
            categories: true,
          },
        },
        brand: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    return orders.map((order) => {
      const isExpired = new Date() > new Date(order.expiresAt);
      const isLimitExceeded = order.downloadCount >= order.downloadLimit;

      return {
        orderId: order.id,
        createdAt: order.createdAt,
        amountPaid: Number(order.amountPaid),
        currency: (order.brand?.themeSettings as any)?.currency || 'USD',
        status: order.status,
        product: {
          id: order.product.id,
          title: order.product.title,
          slug: order.product.slug,
          description: order.product.description,
          shortDescription: order.product.shortDescription,
          media: order.product.media,
          categories: order.product.categories,
        },
        downloadToken: order.downloadToken,
        downloadLimit: order.downloadLimit,
        downloadCount: order.downloadCount,
        expiresAt: order.expiresAt,
        isExpired,
        isLimitExceeded,
        canDownload: !isExpired && !isLimitExceeded,
        downloadUrl: `/api/v1/download/d/${order.downloadToken}`,
        invoiceUrl: `/api/v1/orders/${order.id}/invoice`,
      };
    });
  }

  /**
   * Reissues and extends the download token window for an expired customer order.
   */
  async refreshOrderToken(orderId: string, customerEmail: string) {
    const cleanEmail = customerEmail.trim().toLowerCase();

    const order = await this.prisma.order.findFirst({
      where: {
        id: orderId,
        customer: { email: cleanEmail },
        status: 'PAID',
      },
    });

    if (!order) {
      throw new NotFoundException('Order not found or not eligible for link renewal.');
    }

    const newDownloadToken = crypto.randomBytes(32).toString('hex');
    const newExpiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours extension

    const updated = await this.prisma.order.update({
      where: { id: order.id },
      data: {
        downloadToken: newDownloadToken,
        expiresAt: newExpiresAt,
      },
    });

    this.logger.log(`Customer ${cleanEmail} refreshed download token for order ${order.id}`);

    return {
      orderId: updated.id,
      downloadToken: updated.downloadToken,
      downloadLimit: updated.downloadLimit,
      downloadCount: updated.downloadCount,
      expiresAt: updated.expiresAt,
      isExpired: false,
      isLimitExceeded: updated.downloadCount >= updated.downloadLimit,
      canDownload: updated.downloadCount < updated.downloadLimit,
      downloadUrl: `/api/v1/download/d/${updated.downloadToken}`,
      invoiceUrl: `/api/v1/orders/${updated.id}/invoice`,
    };
  }
}
