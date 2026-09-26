import { Controller, Get, Post, Body, Query, UseGuards } from '@nestjs/common';
import { ConfigService } from '../../config/config.service';
import { SettingRepository } from '../../database/repositories/setting.repository';
import { SaveSettingDto } from './dto/save-setting.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { RequirePermissions } from '../auth/permissions.decorator';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';

@ApiTags('settings')
@Controller('settings')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class SettingsController {
  constructor(
    private readonly configService: ConfigService,
    private readonly settingRepo: SettingRepository,
  ) {}

  @Post()
  @RequirePermissions('setting:create', 'setting:update')
  @ApiOperation({ summary: 'Save or update a setting value' })
  async saveSetting(@Body() saveSettingDto: SaveSettingDto) {
    await this.configService.set(
      saveSettingDto.key,
      saveSettingDto.value,
      saveSettingDto.level,
      saveSettingDto.entityId || null
    );
    return { message: 'Setting saved successfully' };
  }

  @Get()
  @RequirePermissions('setting:read')
  @ApiOperation({ summary: 'Retrieve all settings' })
  async getSettings() {
    return this.settingRepo.findMany();
  }

  @Get('resolve')
  @RequirePermissions('setting:read')
  @ApiOperation({ summary: 'Resolve setting key using hierarchy context' })
  @ApiQuery({ name: 'key', example: 'download_limit' })
  @ApiQuery({ name: 'brandId', required: false })
  @ApiQuery({ name: 'productId', required: false })
  @ApiQuery({ name: 'orderId', required: false })
  async resolveSetting(
    @Query('key') key: string,
    @Query('brandId') brandId?: string,
    @Query('productId') productId?: string,
    @Query('orderId') orderId?: string,
  ) {
    const value = await this.configService.get(key, { brandId, productId, orderId });
    return { key, value };
  }
}
