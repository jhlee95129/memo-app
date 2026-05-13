import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as jwt from 'jsonwebtoken';
import type { Request } from 'express';
import { JwtPayload } from '@memo-app/common';

@Injectable()
export class JwtAuthGuard implements CanActivate {
  private readonly secret: string;

  constructor(configService: ConfigService) {
    this.secret = configService.get<string>('JWT_SECRET', 'default-secret');
  }

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<Request>();
    const authHeader = request.headers.authorization;

    if (!authHeader?.startsWith('Bearer ')) {
      throw new UnauthorizedException('토큰이 필요합니다');
    }

    const token = authHeader.slice(7);

    try {
      const payload = jwt.verify(token, this.secret) as JwtPayload;
      (request as Request & { user: JwtPayload }).user = payload;
      return true;
    } catch {
      throw new UnauthorizedException('유효하지 않은 토큰입니다');
    }
  }
}
