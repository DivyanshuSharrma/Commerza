import {
  Controller,
  Post,
  Get,
  Body,
  Param,
  UseGuards,
  Req,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { CustomerPortalService } from './customer-portal.service';
import { RequestCustomerOtpDto } from './dto/request-otp.dto';
import { VerifyCustomerOtpDto } from './dto/verify-otp.dto';
import { CustomerJwtAuthGuard } from './guards/customer-jwt-auth.guard';

@ApiTags('Customer Portal')
@Controller('customer-portal')
export class CustomerPortalController {
  constructor(private readonly customerPortalService: CustomerPortalService) {}

  @Post('auth/request-otp')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Request 6-digit OTP code and 1-click magic link for customer login' })
  @ApiResponse({ status: 200, description: 'Confirmation that verification code was dispatched' })
  requestOtp(@Body() dto: RequestCustomerOtpDto) {
    return this.customerPortalService.requestOtp(dto);
  }

  @Post('auth/verify')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Verify customer OTP or magic link token and receive scoped customer JWT' })
  @ApiResponse({ status: 200, description: 'Authenticated customer profile and session JWT' })
  verifyOtp(@Body() dto: VerifyCustomerOtpDto) {
    return this.customerPortalService.verifyOtp(dto);
  }

  @Get('orders')
  @UseGuards(CustomerJwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Retrieve all paid digital product orders and active vaults for authenticated customer' })
  @ApiResponse({ status: 200, description: 'List of customer orders with download tokens and invoice links' })
  getCustomerOrders(@Req() req: any) {
    return this.customerPortalService.getCustomerOrders(req.customer.email);
  }

  @Post('orders/:id/refresh-token')
  @UseGuards(CustomerJwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Reissue and extend download window token for an expired customer order' })
  @ApiResponse({ status: 200, description: 'Updated order with fresh download token and active expiration' })
  refreshOrderToken(@Param('id') orderId: string, @Req() req: any) {
    return this.customerPortalService.refreshOrderToken(orderId, req.customer.email);
  }
}
