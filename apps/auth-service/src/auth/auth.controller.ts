import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { AuthService } from './auth.service.js';
import {
  AUTH_PATTERNS,
  RegisterDto,
  LoginDto,
  AuthResponse,
  JwtPayload,
} from '@memo-app/common';

@Controller()
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @MessagePattern(AUTH_PATTERNS.REGISTER)
  register(@Payload() dto: RegisterDto): Promise<AuthResponse> {
    return this.authService.register(dto);
  }

  @MessagePattern(AUTH_PATTERNS.LOGIN)
  login(@Payload() dto: LoginDto): Promise<AuthResponse> {
    return this.authService.login(dto);
  }

  @MessagePattern(AUTH_PATTERNS.VALIDATE_TOKEN)
  validateToken(@Payload() data: { token: string }): Promise<JwtPayload> {
    return this.authService.validateToken(data.token);
  }
}
