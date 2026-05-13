import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ConfigService } from '@nestjs/config';
import { AuthController } from './auth.controller.js';
import { AuthService } from './auth.service.js';
import { User } from './entities/user.entity.js';
import { JwtStrategy } from './strategies/jwt.strategy.js';

@Module({
  imports: [
    TypeOrmModule.forFeature([User]),
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.registerAsync({
      useFactory: (configService: ConfigService) => {
        const expiresIn = configService.get<string>('JWT_EXPIRES_IN') ?? '1h';
        return {
          secret: configService.get<string>('JWT_SECRET', 'default-secret'),
          signOptions: { expiresIn: expiresIn as `${number}${'s' | 'm' | 'h' | 'd'}` },
        };
      },
      inject: [ConfigService],
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy],
  exports: [AuthService],
})
export class AuthModule {}
