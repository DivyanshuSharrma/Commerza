import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';

@Injectable()
export class BrandRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findMany() {
    return this.prisma.brand.findMany();
  }

  async findById(id: string) {
    return this.prisma.brand.findUnique({ where: { id } });
  }

  async findBySubdomain(subdomain: string) {
    return this.prisma.brand.findUnique({ where: { subdomain: subdomain.toLowerCase() } });
  }

  async create(data: any) {
    return this.prisma.brand.create({ data });
  }

  async update(id: string, data: any) {
    return this.prisma.brand.update({ where: { id }, data });
  }

  async delete(id: string) {
    return this.prisma.brand.delete({ where: { id } });
  }
}
