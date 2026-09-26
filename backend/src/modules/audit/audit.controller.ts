import { Controller, Get, UseGuards } from '@nestjs/common';
import { AuditLogRepository } from '../../database/repositories/audit-log.repository';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { RequirePermissions } from '../auth/permissions.decorator';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('audit-logs')
@Controller('audit-logs')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class AuditController {
  constructor(private readonly auditRepo: AuditLogRepository) {}

  @Get()
  @RequirePermissions('audit:read')
  @ApiOperation({ summary: 'Retrieve system administrative audit logs' })
  async getAuditLogs() {
    const logs = await this.auditRepo.findMany();
    return logs;
  }
}
