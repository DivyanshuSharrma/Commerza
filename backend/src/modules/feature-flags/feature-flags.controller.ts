import { Controller, Get, Post, Body, Query, UseGuards } from '@nestjs/common';
import { FeatureFlagsService } from './feature-flags.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { RequirePermissions } from '../auth/permissions.decorator';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { SettingLevel } from '@prisma/client';

@ApiTags('feature-flags')
@Controller('feature-flags')
export class FeatureFlagsController {
  constructor(private readonly flagsService: FeatureFlagsService) {}

  @Get()
  @ApiOperation({ summary: 'Get active feature flags for a brand' })
  @ApiQuery({ name: 'brandId', required: false })
  getFlags(@Query('brandId') brandId?: string) {
    return this.flagsService.getFlags(brandId);
  }

  @Post('toggle')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @RequirePermissions('setting:update')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Toggle a feature flag' })
  async toggleFlag(
    @Body('flag') flag?: string,
    @Body('name') name?: string,
    @Body('value') value?: boolean,
    @Body('level') level?: SettingLevel,
    @Body('entityId') entityId: string | null = null,
  ) {
    const targetFlag = flag || name;
    if (!targetFlag) {
      return { success: false, message: 'Flag identifier is required' };
    }
    const updatedValue = await this.flagsService.toggleFlag(
      targetFlag,
      value,
      level || SettingLevel.GLOBAL,
      entityId,
    );
    return { success: true, flag: targetFlag, value: updatedValue };
  }
}
