import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';

@Injectable()
export class RoleRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findByName(name: string) {
    return this.prisma.role.findFirst({
      where: { name },
    });
  }
}
