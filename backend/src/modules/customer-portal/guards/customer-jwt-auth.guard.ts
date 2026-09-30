import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class CustomerJwtAuthGuard implements CanActivate {
  constructor(private readonly jwtService: JwtService) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const authHeader = request.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedException('Customer authorization token is required.');
    }

    const token = authHeader.split(' ')[1];

    try {
      const payload = this.jwtService.verify(token, {
        secret: process.env.JWT_SECRET || 'commerza-super-secret-key-change-this-in-production',
      });

      if (!payload || payload.type !== 'CUSTOMER' || !payload.email) {
        throw new UnauthorizedException('Invalid customer token identity.');
      }

      request.customer = {
        customerId: payload.sub,
        email: payload.email,
      };

      return true;
    } catch {
      throw new UnauthorizedException('Customer session has expired or is invalid.');
    }
  }
}
