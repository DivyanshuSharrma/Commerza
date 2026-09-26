import { PartialType } from '@nestjs/swagger';
import { CreateBrandDto } from './create-brand.dto';
import { IsOptional, IsEnum } from 'class-validator';
import { BrandStatus } from '@prisma/client';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateBrandDto extends PartialType(CreateBrandDto) {
  @ApiProperty({ enum: BrandStatus, required: false })
  @IsEnum(BrandStatus)
  @IsOptional()
  status?: BrandStatus;
}
