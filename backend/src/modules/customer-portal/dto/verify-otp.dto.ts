import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsOptional, IsString, Length } from 'class-validator';

export class VerifyCustomerOtpDto {
  @ApiProperty({
    example: 'customer@example.com',
    description: 'The email address associated with the verification code',
  })
  @IsEmail({}, { message: 'A valid email address is required' })
  @IsNotEmpty()
  email: string;

  @ApiProperty({
    example: '123456',
    description: 'The 6-digit verification code dispatched to email',
    required: false,
  })
  @IsOptional()
  @IsString()
  @Length(6, 6, { message: 'Verification code must be 6 digits' })
  code?: string;

  @ApiProperty({
    example: 'a1b2c3d4e5f67890123456789abcdef0',
    description: 'The cryptographic magic link token passed in URL',
    required: false,
  })
  @IsOptional()
  @IsString()
  token?: string;
}
