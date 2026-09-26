import { IsNotEmpty, IsOptional, IsString, IsEnum } from 'class-validator';
import { SettingLevel } from '@prisma/client';
import { ApiProperty } from '@nestjs/swagger';

export class SaveSettingDto {
  @ApiProperty({ example: 'download_limit' })
  @IsString()
  @IsNotEmpty()
  key!: string;

  @ApiProperty({ example: '10' })
  @IsString()
  @IsNotEmpty()
  value!: string;

  @ApiProperty({ enum: SettingLevel, example: 'BRAND' })
  @IsEnum(SettingLevel)
  @IsNotEmpty()
  level!: SettingLevel;

  @ApiProperty({ example: 'brand-id-uuid', required: false })
  @IsString()
  @IsOptional()
  entityId?: string;
}
