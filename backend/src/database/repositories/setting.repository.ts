import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { SettingLevel } from '@prisma/client';

@Injectable()
export class SettingRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findMany(where?: any) {
    return this.prisma.setting.findMany({ where });
  }

  async findUniqueSetting(level: SettingLevel, key: string, entityId: string | null) {
    return this.prisma.setting.findFirst({
      where: {
        level,
        key,
        entityId,
      },
    });
  }

  async upsert(level: SettingLevel, key: string, value: string, entityId: string | null) {
    const existing = await this.findUniqueSetting(level, key, entityId);
    if (existing) {
      return this.prisma.setting.update({
        where: { id: existing.id },
        data: { value },
      });
    }
    return this.prisma.setting.create({
      data: {
        level,
        key,
        value,
        entityId,
      },
    });
  }
}
