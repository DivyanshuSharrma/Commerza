import { Controller, Post, Get, Param, Query, Body, UseGuards, ForbiddenException, Logger } from '@nestjs/common';
import { OrderQueryService } from './order-query.service';
import { OrderCommandService } from './order-command.service';
import { CreateOrderDto } from './dto/create-order.dto';
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
    private readonly configService: ConfigService,
  ) {}

  @Post('checkout')
  @ApiOperation({ summary: 'Initiate digital checkout flow' })
  checkout(@Body() createOrderDto: CreateOrderDto) {
    return this.orderCommandService.checkout(createOrderDto);
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
  @ApiOperation({ summary: 'Retrieve all orders' })
  @ApiQuery({ name: 'brandId', required: false })
  findAll(@Query('brandId') brandId?: string) {
    return this.orderQueryService.findAll(brandId);
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
