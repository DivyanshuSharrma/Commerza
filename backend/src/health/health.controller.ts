import { Controller, Get } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { ApiTags, ApiOperation } from '@nestjs/swagger';

@ApiTags('health')
@Controller('health')
export class HealthController {
  constructor(private readonly prisma: PrismaService) {}

  @Get()
  @ApiOperation({ summary: 'System diagnostics health check' })
  async getHealth() {
    let dbStatus = 'UP';
    try {
      await this.prisma.$queryRaw`SELECT 1`;
    } catch {
      dbStatus = 'DOWN';
    }

    return {
      status: dbStatus === 'UP' ? 'UP' : 'DOWN',
      timestamp: new Date().toISOString(),
      checks: {
        database: dbStatus,
        storage: 'UP',
        cache: 'UP',
      },
    };
  }

  @Get('ready')
  @ApiOperation({ summary: 'Readiness probe' })
  getReady() {
    return { status: 'READY' };
  }

  @Get('live')
  @ApiOperation({ summary: 'Liveness probe' })
  getLive() {
    return { status: 'LIVE' };
  }
}
