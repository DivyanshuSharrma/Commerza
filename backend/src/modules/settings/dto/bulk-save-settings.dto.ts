import { IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { SaveSettingDto } from './save-setting.dto';

export class BulkSaveSettingsDto {
  @ApiProperty({ type: [SaveSettingDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SaveSettingDto)
  settings!: SaveSettingDto[];
}
