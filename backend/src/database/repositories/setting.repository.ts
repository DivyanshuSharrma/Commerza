import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { SettingLevel } from '@prisma/client';
import { EncryptionService } from '../../common/services/encryption.service';

@Injectable()
export class SettingRepository {
  constructor(
    private readonly prisma: PrismaService,
    private readonly encryptionService: EncryptionService,
  ) {}

  async findMany(where?: any) {
    const list = await this.prisma.setting.findMany({ where });
    return list.map((s) => ({
      ...s,
      value: this.encryptionService.isEncrypted(s.value)
        ? this.encryptionService.decrypt(s.value)
        : s.value,
    }));
  }

  async findUniqueSetting(level: SettingLevel, key: string, entityId: string | null) {
    const setting = await this.prisma.setting.findFirst({
      where: {
        level,
        key,
        entityId,
      },
    });

    if (!setting) return null;

    return {
      ...setting,
      value: this.encryptionService.isEncrypted(setting.value)
        ? this.encryptionService.decrypt(setting.value)
        : setting.value,
    };
  }

  async upsert(level: SettingLevel, key: string, value: string, entityId: string | null) {
    const existing = await this.findUniqueSetting(level, key, entityId);

    // Encrypt if key is sensitive and value is not already encrypted
    const encryptedValue =
      this.encryptionService.isSensitiveKey(key) && !this.encryptionService.isEncrypted(value)
        ? this.encryptionService.encrypt(value)
        : value;

    if (existing) {
      return this.prisma.setting.update({
        where: { id: existing.id },
        data: { value: encryptedValue },
      });
    }
    return this.prisma.setting.create({
      data: {
        level,
        key,
        value: encryptedValue,
        entityId,
      },
    });
  }
}

