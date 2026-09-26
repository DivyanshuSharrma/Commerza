import { IsEmail, IsOptional, MinLength, IsString } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateProfileDto {
  @ApiPropertyOptional({ example: 'Super Admin' })
  @IsOptional()
  @IsString()
  @MinLength(2)
  name?: string;

  @ApiPropertyOptional({ example: 'admin@commerza.com' })
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiPropertyOptional({ description: 'Current password, required if updating password' })
  @IsOptional()
  @IsString()
  @MinLength(6)
  currentPassword?: string;

  @ApiPropertyOptional({ description: 'New password for the account' })
  @IsOptional()
  @IsString()
  @MinLength(6)
  newPassword?: string;
}
