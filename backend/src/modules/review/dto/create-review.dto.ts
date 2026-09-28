import { IsEmail, IsNotEmpty, IsString, IsOptional, IsInt, Min, Max } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateReviewDto {
  @ApiProperty({ example: 'product-uuid' })
  @IsString()
  @IsNotEmpty()
  productId!: string;

  @ApiProperty({ example: 'brand-uuid' })
  @IsString()
  @IsNotEmpty()
  brandId!: string;

  @ApiProperty({ example: 'Sarah Jenkins' })
  @IsString()
  @IsNotEmpty()
  authorName!: string;

  @ApiProperty({ example: 'sarah@enterprise.io' })
  @IsEmail()
  @IsNotEmpty()
  authorEmail!: string;

  @ApiProperty({ example: 5, minimum: 1, maximum: 5 })
  @IsInt()
  @Min(1)
  @Max(5)
  rating!: number;

  @ApiProperty({ example: 'Phenomenal architecture and clean code', required: false })
  @IsString()
  @IsOptional()
  title?: string;

  @ApiProperty({ example: 'Saved our engineering team over 200 hours. The TypeScript types and modular structure are production-grade.' })
  @IsString()
  @IsNotEmpty()
  comment!: string;
}

export class UpdateReviewStatusDto {
  @ApiProperty({ enum: ['APPROVED', 'PENDING', 'REJECTED'], example: 'APPROVED' })
  @IsString()
  @IsNotEmpty()
  status!: 'APPROVED' | 'PENDING' | 'REJECTED';
}
