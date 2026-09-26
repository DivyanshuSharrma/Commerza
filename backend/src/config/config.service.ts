import { Injectable } from '@nestjs/common';
import { ConfigResolverService, ConfigContext } from './resolver/config-resolver.service';
import { SettingRepository } from '../database/repositories/setting.repository';
import { SettingLevel } from '@prisma/client';

@Injectable()
export class ConfigService {
  constructor(
    private readonly resolver: ConfigResolverService,
    private readonly settingRepo: SettingRepository,
  ) {}

  async get(key: string, context?: ConfigContext, defaultValue?: string): Promise<string> {
    return this.resolver.resolve(key, context, defaultValue || '');
  }

  async getNumber(key: string, context?: ConfigContext, defaultValue?: number): Promise<number> {
    return this.resolver.getNumber(key, context, defaultValue || 0);
  }

  async getBoolean(key: string, context?: ConfigContext, defaultValue?: boolean): Promise<boolean> {
    return this.resolver.getBoolean(key, context, defaultValue || false);
  }

  async set(key: string, value: string, level: SettingLevel, entityId: string | null = null): Promise<void> {
    await this.settingRepo.upsert(level, key, value, entityId);
  }
}
export type { ConfigContext };
