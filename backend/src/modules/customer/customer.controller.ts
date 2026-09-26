import { Controller, Get, Patch, Param, Body, UseGuards } from '@nestjs/common';
import { CustomerRepository } from '../../database/repositories/customer.repository';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { RequirePermissions } from '../auth/permissions.decorator';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('customers')
@Controller('customers')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class CustomerController {
  constructor(private readonly customerRepo: CustomerRepository) {}

  @Get()
  @RequirePermissions('customer:read')
  @ApiOperation({ summary: 'Retrieve all shoppers' })
  async getCustomers() {
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
