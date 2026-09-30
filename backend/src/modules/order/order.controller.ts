import { Controller, Post, Get, Param, Query, Body, UseGuards, ForbiddenException, Logger, Res } from '@nestjs/common';
import type * as express from 'express';
import { OrderQueryService } from './order-query.service';
import { OrderCommandService } from './order-command.service';
import { InvoicePdfService } from './invoice-pdf.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { RecoverOrderDto } from './dto/recover-order.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { RequirePermissions } from '../auth/permissions.decorator';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { ConfigService } from '../../config/config.service';

@ApiTags('orders')
@Controller('orders')
export class OrderController {
  private readonly logger = new Logger(OrderController.name);

  constructor(
    private readonly orderQueryService: OrderQueryService,
    private readonly orderCommandService: OrderCommandService,
    private readonly invoicePdfService: InvoicePdfService,
    private readonly configService: ConfigService,
  ) {}

  @Post('checkout')
  @ApiOperation({ summary: 'Initiate digital checkout flow' })
  checkout(@Body() createOrderDto: CreateOrderDto) {
    return this.orderCommandService.checkout(createOrderDto);
  }

  @Post('recover')
  @ApiOperation({ summary: 'Customer order lookup & recovery (resends download links to verified customer email)' })
  recover(@Body() dto: RecoverOrderDto) {
    this.logger.log(`Customer requested order recovery for email: ${dto.email}`);
    return this.orderCommandService.recoverOrdersByEmail(dto.email, dto.brandId);
  }

  @Post('mock-fulfill/:id')
  @ApiOperation({ summary: 'Mock fulfillment (bypass real webhooks for testing)' })
  async mockFulfill(@Param('id') id: string, @Body('paymentId') paymentId: string) {
    const provider = await this.configService.get('payment_provider', {}, 'MOCK');
    if (provider.toUpperCase() !== 'MOCK') {
      throw new ForbiddenException('Mock fulfillment is only allowed when payment_provider is set to MOCK');
    }
    return this.orderCommandService.fulfillOrder(id, paymentId || `mock_fulfill_${Date.now()}`);
  }

  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @RequirePermissions('order:read')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Retrieve orders with pagination and filtering' })
  @ApiQuery({ name: 'brandId', required: false })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'search', required: false, type: String })
  @ApiQuery({ name: 'status', required: false, type: String })
  findAll(
    @Query('brandId') brandId?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('search') search?: string,
    @Query('status') status?: string,
  ) {
    if (page !== undefined || limit !== undefined || search !== undefined || status !== undefined) {
      return this.orderQueryService.findPaginated({
        brandId,
        page: page ? parseInt(page, 10) : 1,
        limit: limit ? parseInt(limit, 10) : 10,
        search,
        status,
      });
    }
    return this.orderQueryService.findAll(brandId);
  }

  @Get(':id/invoice')
  @ApiOperation({ summary: 'Generate and stream automated vector PDF invoice for an order' })
  async getInvoice(
    @Param('id') id: string,
    @Res() res: express.Response,
  ) {
    this.logger.log(`Invoice request received for Order ID: ${id}`);
    const order = await this.orderQueryService.findOne(id);
    const pdfBuffer = await this.invoicePdfService.generateInvoiceBuffer(order);

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader(
      'Content-Disposition',
      `inline; filename="Invoice-${id.slice(0, 8).toUpperCase()}.pdf"`,
    );
    res.setHeader('Content-Length', pdfBuffer.length);
    res.end(pdfBuffer);
  }

  @Get('status/:id')
  @ApiOperation({ summary: 'Retrieve public order status and download link for customers' })
  async getStatus(@Param('id') id: string) {
    this.logger.log(`[Order Verification] Guest checkout lookup initiated for Order ID: ${id}`);
    try {
      const order = await this.orderQueryService.findOne(id);
      return {
        id: order.id,
        status: order.status,
        totalPrice: order.amountPaid.toString(),
        email: order.customer.email,
        product: {
          title: order.product.title,
        },
        downloadTokens: [
          {
            token: order.downloadToken,
            expiresAt: order.expiresAt,
            downloadLimit: order.downloadLimit,
            downloadCount: order.downloadCount,
          }
        ],
      };
    } catch (err: any) {
      this.logger.error(
        `[Order Verification Failed] Root cause explanation: Guest customer verification failed because the frontend previously queried GET /orders/:id which is protected by JwtAuthGuard & RolesGuard (requiring admin permissions). Guest sessions returned 401 Unauthorized. Fixed by mapping to public GET /orders/status/:id endpoint. Details: ${err.message}`
      );
      throw err;
    }
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @RequirePermissions('order:read')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Retrieve order by ID' })
  findOne(@Param('id') id: string) {
    return this.orderQueryService.findOne(id);
  }

  @Post(':id/resend-email')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @RequirePermissions('order:update')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Manually resend fulfillment email for a paid order' })
  resendEmail(@Param('id') id: string) {
    return this.orderCommandService.resendFulfillmentEmail(id);
  }

  @Post(':id/regenerate-link')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @RequirePermissions('order:update')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Manually regenerate download link for an order' })
  regenerateLink(@Param('id') id: string) {
    return this.orderCommandService.regenerateDownloadLink(id);
  }
}
