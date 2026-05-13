import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { RpcException } from '@nestjs/microservices';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User } from './entities/user.entity.js';
import {
  RegisterDto,
  LoginDto,
  AuthResponse,
  JwtPayload,
} from '@memo-app/common';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly jwtService: JwtService,
  ) {}

  async register(dto: RegisterDto): Promise<AuthResponse> {
    const existing = await this.userRepository.findOne({
      where: { email: dto.email },
    });
    if (existing) {
      throw new RpcException({
        statusCode: 409,
        message: '이미 등록된 이메일입니다',
      });
    }

    const hashedPassword = await bcrypt.hash(dto.password, 10);
    const user = this.userRepository.create({
      email: dto.email,
      password: hashedPassword,
    });
    await this.userRepository.save(user);

    return this.generateToken(user);
  }

  async login(dto: LoginDto): Promise<AuthResponse> {
    const user = await this.userRepository.findOne({
      where: { email: dto.email },
    });
    if (!user) {
      throw new RpcException({
        statusCode: 401,
        message: '이메일 또는 비밀번호가 올바르지 않습니다',
      });
    }

    const isPasswordValid = await bcrypt.compare(dto.password, user.password);
    if (!isPasswordValid) {
      throw new RpcException({
        statusCode: 401,
        message: '이메일 또는 비밀번호가 올바르지 않습니다',
      });
    }

    return this.generateToken(user);
  }

  async validateToken(token: string): Promise<JwtPayload> {
    try {
      return this.jwtService.verify<JwtPayload>(token);
    } catch {
      throw new RpcException({
        statusCode: 401,
        message: '유효하지 않은 토큰입니다',
      });
    }
  }

  private generateToken(user: User): AuthResponse {
    const payload: JwtPayload = { sub: user.id, email: user.email };
    return {
      accessToken: this.jwtService.sign(payload),
    };
  }
}
