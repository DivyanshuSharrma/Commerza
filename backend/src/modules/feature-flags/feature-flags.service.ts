import { Injectable } from '@nestjs/common';
import { SettingRepository } from '../../database/repositories/setting.repository';
import { SettingLevel } from '@prisma/client';

@Injectable()
export class FeatureFlagsService {
  constructor(private readonly settingRepo: SettingRepository) {}

  async isEnabled(flag: string, brandId?: string): Promise<boolean> {
    const key = `flag_${flag}`;
    
    // Check Brand level flag
    if (brandId) {
      const s = await this.settingRepo.findUniqueSetting(SettingLevel.BRAND, key, brandId);
      if (s) return s.value === 'true' || s.value === '1';
    }

    // Check Global level flag
    const globalS = await this.settingRepo.findUniqueSetting(SettingLevel.GLOBAL, key, null);
    if (globalS) return globalS.value === 'true' || globalS.value === '1';

    // Check System level flag
    const systemS = await this.settingRepo.findUniqueSetting(SettingLevel.SYSTEM, key, null);
    if (systemS) return systemS.value === 'true' || systemS.value === '1';

    return false;
  }

  async getFlags(brandId?: string) {
    const prefix = 'flag_';
    const settings = await this.settingRepo.findMany({
      where: { key: { startsWith: prefix } },
    });

    const flags: Record<string, boolean> = {};
    for (const s of settings) {
      const flagName = s.key.replace(prefix, '');
      if (s.level === 'SYSTEM' || s.level === 'GLOBAL' || (s.level === 'BRAND' && s.entityId === brandId)) {
        flags[flagName] = s.value === 'true' || s.value === '1';
      }
    }
    return flags;
  }

  async toggleFlag(flag: string, value: boolean, level: SettingLevel, entityId: string | null = null): Promise<void> {
    const key = `flag_${flag}`;
    await this.settingRepo.upsert(level, key, value.toString(), entityId);
  }
}
