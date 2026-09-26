import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';

@Injectable()
export class AuditLogRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findMany() {
    return this.prisma.auditLog.findMany({
      include: { user: { select: { name: true, email: true } } },
      orderBy: { createdAt: 'desc' },
    });
  }

  async create(data: {
    userId?: string | null;
    action: string;
    details: any;
    ipAddress?: string | null;
  }) {
    return this.prisma.auditLog.create({ data });
  }
}
