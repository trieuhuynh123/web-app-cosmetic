// src/auth/auth.module.ts

import { Module, Global } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';

import { JwtModule } from '@nestjs/jwt';
import { UserModule } from '../user/user.module';
import { MailService } from '../mail/mail.service';

@Global()
@Module({
  imports: [
    UserModule,
    JwtModule.registerAsync({
      global: true, // Đặt global: true ở đây
      useFactory: async () => ({
        secret: process.env.JWT_SECRET_KEY,
        signOptions: { expiresIn: process.env.JWT_EXPIRATION_TIME },
      }),
    }),
  ],
  providers: [AuthService, MailService],
  controllers: [AuthController],
  exports: [AuthService, JwtModule],
})
export class AuthModule { }
