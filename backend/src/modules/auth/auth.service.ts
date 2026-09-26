import { Injectable, UnauthorizedException, HttpStatus } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../../database/prisma.service';
import * as bcrypt from 'bcryptjs';
import { LoginDto } from './dto/login.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { BusinessException } from '../../common/exceptions/custom.exceptions';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
  ) {}

  async login(loginDto: LoginDto) {
    const { email, password } = loginDto;

    const user = await this.prisma.user.findUnique({
      where: { email },
      include: { role: true },
    });

    if (!user || user.status === 'INACTIVE') {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const payload = {
      email: user.email,
      sub: user.id,
      role: user.role.name,
      permissions: user.role.permissions,
    };

    return {
      accessToken: this.jwtService.sign(payload),
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role.name,
      },
    };
  }

  async getProfile(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        name: true,
        status: true,
        role: {
          select: {
            name: true,
            permissions: true,
          },
        },
      },
    });

    if (!user) {
      throw new BusinessException('User profile not found', HttpStatus.NOT_FOUND);
    }

    return user;
  }

  async updateProfile(userId: string, dto: UpdateProfileDto) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new BusinessException('User profile not found', HttpStatus.NOT_FOUND);
    }

    const data: any = {};
    if (dto.name) data.name = dto.name;
    
    if (dto.email) {
      const existing = await this.prisma.user.findUnique({
        where: { email: dto.email },
      });
      if (existing && existing.id !== userId) {
        throw new BusinessException('Email address is already in use', HttpStatus.CONFLICT);
      }
      data.email = dto.email;
    }

    if (dto.newPassword) {
      if (!dto.currentPassword) {
        throw new BusinessException('Current password is required to change password', HttpStatus.BAD_REQUEST);
      }
      const isPasswordValid = await bcrypt.compare(dto.currentPassword, user.password);
      if (!isPasswordValid) {
        throw new BusinessException('Incorrect current password provided', HttpStatus.UNAUTHORIZED);
      }
      data.password = await bcrypt.hash(dto.newPassword, 10);
    }

    const updated = await this.prisma.user.update({
      where: { id: userId },
      data,
      select: {
        id: true,
        email: true,
        name: true,
      },
    });

    return updated;
  }
}
