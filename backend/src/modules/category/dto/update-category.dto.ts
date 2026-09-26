import { IsOptional, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateCategoryDto {
  @ApiProperty({ example: 'E-Books & Manuals', required: false })
  @IsString()
  @IsOptional()
  name?: string;

  @ApiProperty({ example: 'ebooks-manuals', required: false })
  @IsString()
  @IsOptional()
  slug?: string;

  @ApiProperty({ example: 'Updated category description', required: false })
  @IsString()
  @IsOptional()
  description?: string;
}
