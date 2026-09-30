import { Controller, Get, Patch, Param, Body, Query, UseGuards } from '@nestjs/common';
import { CustomerRepository } from '../../database/repositories/customer.repository';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { RequirePermissions } from '../auth/permissions.decorator';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';

@ApiTags('customers')
@Controller('customers')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class CustomerController {
  constructor(private readonly customerRepo: CustomerRepository) {}

  @Get()
  @RequirePermissions('customer:read')
  @ApiOperation({ summary: 'Retrieve shoppers with pagination and search' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'search', required: false, type: String })
  @ApiQuery({ name: 'status', required: false, type: String })
  async getCustomers(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('search') search?: string,
    @Query('status') status?: string,
  ) {
    if (page !== undefined || limit !== undefined || search !== undefined || status !== undefined) {
      return this.customerRepo.findPaginated({
        page: page ? parseInt(page, 10) : 1,
        limit: limit ? parseInt(limit, 10) : 10,
        search,
        status,
      });
    }
    const list = await this.customerRepo.findMany();
    return list;
  }

  @Patch(':id/status')
  @RequirePermissions('customer:update')
  @ApiOperation({ summary: 'Suspend or activate a customer' })
  async updateStatus(
    @Param('id') id: string,
    @Body('status') status: 'ACTIVE' | 'SUSPENDED',
  ) {
    const customer = await this.customerRepo.update(id, { status });
    return customer;
  }
}
