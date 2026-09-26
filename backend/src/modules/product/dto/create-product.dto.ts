import { IsNotEmpty, IsOptional, IsString, IsEnum, IsArray, IsNumber } from 'class-validator';
import { DeliveryType } from '@prisma/client';
import { ApiProperty } from '@nestjs/swagger';

export class CreateProductDto {
  @ApiProperty({ example: 'brand-id-uuid' })
  @IsString()
  @IsNotEmpty()
  brandId!: string;

  @ApiProperty({ example: 'My Ebook' })
  @IsString()
  @IsNotEmpty()
  title!: string;

  @ApiProperty({ example: 'my-ebook', required: false })
  @IsString()
  @IsOptional()
  slug?: string;

  @ApiProperty({ example: 'Complete guide to coding.' })
  @IsString()
  @IsNotEmpty()
  description!: string;

  @ApiProperty({ example: 'Short overview', required: false })
  @IsString()
  @IsOptional()
  shortDescription?: string;

  @ApiProperty({ example: 9.99 })
  @IsNotEmpty()
  price!: number;

  @ApiProperty({ example: 4.99, required: false })
  @IsNumber()
  @IsOptional()
  salePrice?: number;

  @ApiProperty({ example: 'Feature 1\nFeature 2', required: false })
  @IsString()
  @IsOptional()
  features?: string;

  @ApiProperty({ example: 'Spec 1\nSpec 2', required: false })
  @IsString()
  @IsOptional()
  specifications?: string;

  @ApiProperty({ example: 'Item 1\nItem 2', required: false })
  @IsString()
  @IsOptional()
  whatsIncluded?: string;

  @ApiProperty({ enum: DeliveryType, example: 'INTERNAL_FILE' })
  @IsEnum(DeliveryType)
  @IsNotEmpty()
  deliveryType!: DeliveryType;

  @ApiProperty({ example: { filePath: 'files/ebook.pdf' } })
  @IsNotEmpty()
  deliveryConfig!: any;

  @ApiProperty({ example: 'My Ebook - Code Guide', required: false })
  @IsString()
  @IsOptional()
  seoTitle?: string;

  @ApiProperty({ example: 'Learn to code fast.', required: false })
  @IsString()
  @IsOptional()
  seoDescription?: string;

  @ApiProperty({ example: 'coding, tutorial, learning', required: false })
  @IsString()
  @IsOptional()
  seoKeywords?: string;

  @ApiProperty({ example: 'https://myshop.com/ebook-cover.png', required: false })
  @IsString()
  @IsOptional()
  seoOgImage?: string;

  @ApiProperty({ type: [String], required: false })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  categoryIds?: string[];

  @ApiProperty({ required: false })
  @IsArray()
  @IsOptional()
  media?: any[];
}
