import { IsNotEmpty, IsOptional, IsString, IsHexColor } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateBrandDto {
  @ApiProperty({ example: 'Commerza Shop' })
  @IsString()
  @IsNotEmpty()
  name!: string;

  @ApiProperty({ example: 'myshop' })
  @IsString()
  @IsNotEmpty()
  subdomain!: string;

  @ApiProperty({ example: 'myshop.com', required: false })
  @IsString()
  @IsOptional()
  customDomain?: string;

  @ApiProperty({ example: 'https://myshop.com/logo.png', required: false })
  @IsString()
  @IsOptional()
  logoUrl?: string;

  @ApiProperty({ example: 'https://myshop.com/favicon.ico', required: false })
  @IsString()
  @IsOptional()
  faviconUrl?: string;

  @ApiProperty({ example: '#4f46e5', required: false })
  @IsHexColor()
  @IsOptional()
  primaryColor?: string;

  @ApiProperty({ example: '#06b6d4', required: false })
  @IsHexColor()
  @IsOptional()
  secondaryColor?: string;

  @ApiProperty({ example: { heroTitle: 'Welcome' }, required: false })
  @IsOptional()
  themeSettings?: any;
}
