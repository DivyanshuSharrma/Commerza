import { Injectable, Logger } from '@nestjs/common';
import { SettingRepository } from '../../database/repositories/setting.repository';
import { SettingLevel } from '@prisma/client';

export interface ConfigContext {
  brandId?: string | null;
  productId?: string | null;
  orderId?: string | null;
}

@Injectable()
export class ConfigResolverService {
  private readonly logger = new Logger(ConfigResolverService.name);

  constructor(private readonly settingRepo: SettingRepository) {}

  async resolve(key: string, context: ConfigContext = {}, defaultValue: string): Promise<string> {
    // 1. Order level
    if (context.orderId) {
      const s = await this.settingRepo.findUniqueSetting(SettingLevel.ORDER, key, context.orderId);
      if (s) return s.value;
    }

    // 2. Product level
    if (context.productId) {
      const s = await this.settingRepo.findUniqueSetting(SettingLevel.PRODUCT, key, context.productId);
      if (s) return s.value;
    }

    // 3. Brand level
    if (context.brandId) {
      const s = await this.settingRepo.findUniqueSetting(SettingLevel.BRAND, key, context.brandId);
      if (s) return s.value;
    }

    // 4. Global level
    const globalSetting = await this.settingRepo.findUniqueSetting(SettingLevel.GLOBAL, key, null);
    if (globalSetting) return globalSetting.value;

    // 5. System level
    const systemSetting = await this.settingRepo.findUniqueSetting(SettingLevel.SYSTEM, key, null);
    if (systemSetting) return systemSetting.value;

    return defaultValue;
  }

  async getNumber(key: string, context: ConfigContext = {}, defaultValue: number): Promise<number> {
    const val = await this.resolve(key, context, defaultValue.toString());
    const parsed = parseFloat(val);
    return isNaN(parsed) ? defaultValue : parsed;
  }

  async getBoolean(key: string, context: ConfigContext = {}, defaultValue: boolean): Promise<boolean> {
    const val = await this.resolve(key, context, defaultValue.toString());
    return val === 'true' || val === '1';
  }
}
