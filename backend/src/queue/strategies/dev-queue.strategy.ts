import { QueueStrategy } from '../queue-strategy.interface';
import { Injectable, Logger } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';

@Injectable()
export class DevQueueStrategy implements QueueStrategy {
  private readonly logger = new Logger(DevQueueStrategy.name);

  constructor(private readonly eventEmitter: EventEmitter2) {}

  async enqueue(jobName: string, data: any): Promise<void> {
    this.logger.debug(`[DevQueue] Enqueued job: ${jobName}`);
    setTimeout(() => {
      this.eventEmitter.emit(`job.${jobName}`, data);
    }, 100);
  }
}
