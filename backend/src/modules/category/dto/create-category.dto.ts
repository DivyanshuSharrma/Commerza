import { IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateCategoryDto {
  @ApiProperty({ example: 'brand-uuid' })
  @IsString()
  @IsNotEmpty()
  brandId!: string;

  @ApiProperty({ example: 'E-Books & Guides' })
  @IsString()
  @IsNotEmpty()
  name!: string;

  @ApiProperty({ example: 'ebooks-guides', required: false })
  @IsString()
  @IsOptional()
  slug?: string;

  @ApiProperty({ example: 'Curated downloadable manuals and guides', required: false })
  @IsString()
  @IsOptional()
  description?: string;
}
