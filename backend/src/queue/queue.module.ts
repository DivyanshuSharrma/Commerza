import { Module, Global } from '@nestjs/common';
import { DevQueueStrategy } from './strategies/dev-queue.strategy';
import { BullMqQueueStrategy } from './strategies/bullmq-queue.strategy';
import { QueueFactory } from './queue.factory';
import { QueueProcessor } from './queue.processor';
import { DatabaseModule } from '../database/database.module';
import { NotificationModule } from '../modules/notification/notification.module';

@Global()
@Module({
  imports: [DatabaseModule, NotificationModule],
  providers: [DevQueueStrategy, BullMqQueueStrategy, QueueFactory, QueueProcessor],
  exports: [QueueFactory],
})
export class QueueModule {}
