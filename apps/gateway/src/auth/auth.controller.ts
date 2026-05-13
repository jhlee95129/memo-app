import { Body, Controller, Inject, Post, UseFilters } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import {
  AUTH_SERVICE,
  AUTH_PATTERNS,
  RegisterDto,
  LoginDto,
  AuthResponse,
} from '@memo-app/common';
import { RpcExceptionFilter } from '../common/filters/rpc-exception.filter.js';

@Controller('auth')
@UseFilters(RpcExceptionFilter)
export class AuthController {
  constructor(
    @Inject(AUTH_SERVICE) private readonly authClient: ClientProxy,
  ) {}

  @Post('register')
  register(@Body() dto: RegisterDto): Promise<AuthResponse> {
    return firstValueFrom(
      this.authClient.send<AuthResponse>(AUTH_PATTERNS.REGISTER, dto),
    );
  }

  @Post('login')
  login(@Body() dto: LoginDto): Promise<AuthResponse> {
    return firstValueFrom(
      this.authClient.send<AuthResponse>(AUTH_PATTERNS.LOGIN, dto),
    );
  }
}
