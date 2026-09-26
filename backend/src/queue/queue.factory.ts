import { Injectable } from '@nestjs/common';
import { DevQueueStrategy } from './strategies/dev-queue.strategy';
import { BullMqQueueStrategy } from './strategies/bullmq-queue.strategy';
import { QueueStrategy } from './queue-strategy.interface';
import { ConfigService } from '../config/config.service';

@Injectable()
export class QueueFactory {
  constructor(
    private readonly devStrategy: DevQueueStrategy,
    private readonly bullStrategy: BullMqQueueStrategy,
    private readonly configService: ConfigService,
  ) {}

  async getStrategy(): Promise<QueueStrategy> {
    const queueProvider = await this.configService.get('queue_provider', {}, 'DEV');
    if (queueProvider === 'BULLMQ') {
      return this.bullStrategy;
    }
    return this.devStrategy;
  }
}
