import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class RequestCustomerOtpDto {
  @ApiProperty({
    example: 'customer@example.com',
    description: 'The email address associated with past digital product orders',
  })
  @IsEmail({}, { message: 'A valid email address is required' })
  @IsNotEmpty()
  email: string;

  @ApiProperty({
    example: 'default',
    description: 'Optional brand identifier or subdomain context',
    required: false,
  })
  @IsOptional()
  @IsString()
  brandId?: string;
}
