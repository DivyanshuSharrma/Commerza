import { Injectable } from '@nestjs/common';
import { PrismaService } from './prisma.service';

@Injectable()
export class TransactionService {
  constructor(private readonly prisma: PrismaService) {}

  async run<T>(callback: (tx: any) => Promise<T>): Promise<T> {
    return this.prisma.$transaction(async (tx) => {
      return callback(tx);
    });
  }
}
