import { QueueStrategy } from '../queue-strategy.interface';
import { Injectable, Logger } from '@nestjs/common';

@Injectable()
export class BullMqQueueStrategy implements QueueStrategy {
  private readonly logger = new Logger(BullMqQueueStrategy.name);

  async enqueue(jobName: string, data: any): Promise<void> {
    this.logger.debug(`[BullMqQueue] Dispatching job: ${jobName} with payload: ${JSON.stringify(data)}`);
  }
}
