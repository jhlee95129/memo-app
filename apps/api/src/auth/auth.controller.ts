import { Body, Controller, Post } from '@nestjs/common';
import { AuthService } from './auth.service.js';
import { RegisterDto, LoginDto, AuthResponse } from '@memo-app/common';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  register(@Body() dto: RegisterDto): Promise<AuthResponse> {
    return this.authService.register(dto);
  }

  @Post('login')
  login(@Body() dto: LoginDto): Promise<AuthResponse> {
    return this.authService.login(dto);
  }
}
