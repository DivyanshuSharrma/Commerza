import { IsEmail, IsNotEmpty, IsString, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateOrderDto {
  @ApiProperty({ example: 'customer@email.com' })
  @IsEmail()
  @IsNotEmpty()
  email!: string;

  @ApiProperty({ example: 'John Doe', required: false })
  @IsString()
  @IsOptional()
  name?: string;

  @ApiProperty({ example: 'product-uuid' })
  @IsString()
  @IsNotEmpty()
  productId!: string;

  @ApiProperty({ example: 'brand-uuid' })
  @IsString()
  @IsNotEmpty()
  brandId!: string;
}
