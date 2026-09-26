import { IsEmail, IsNotEmpty, IsString, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class RecoverOrderDto {
  @ApiProperty({ example: 'customer@email.com', description: 'Customer email used during checkout' })
  @IsEmail()
  @IsNotEmpty()
  email!: string;

  @ApiProperty({ example: 'brand-uuid', required: false, description: 'Optional Brand ID to filter orders' })
  @IsString()
  @IsOptional()
  brandId?: string;
}
