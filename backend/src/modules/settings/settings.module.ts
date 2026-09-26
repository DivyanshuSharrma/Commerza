import { Module } from '@nestjs/common';
import { SettingsController } from './settings.controller';
import { DatabaseModule } from '../../database/database.module';

@Module({
  imports: [DatabaseModule],
  controllers: [SettingsController],
})
export class SettingsModule {}
