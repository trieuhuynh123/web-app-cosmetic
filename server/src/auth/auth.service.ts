import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UserDocument } from 'src/user/entities/user.entity';
import { UserService } from 'src/user/user.service';

@Injectable()
export class AuthService {
  constructor(
    private userService: UserService,
    private jwtService: JwtService,
  ) {}

  async signIn(
    email: string,
    pass: string,
  ): Promise<{ access_token: string; refresh_token: string }> {
    const user = await this.userService.findByEmail(email);
    if (user?.password !== pass) {
      throw new UnauthorizedException();
    }
    const payloadAccess = {
      id: user._id,
      name: user.name,
      email: user.email,
      address: user.address,
    };

    const refresh_token = await this.getOrCreateRefreshToken(user);

    return {
      access_token: await this.jwtService.signAsync(payloadAccess),
      refresh_token: refresh_token,
    };
  }

  async getOrCreateRefreshToken(user: UserDocument): Promise<string> {
    const refreshToken = user.refresh_token;

    if (!refreshToken) {
      const payloadRefresh = { userId: user.id };

      const newRefreshToken = await this.jwtService.signAsync(payloadRefresh, {
        secret: process.env.REFRESH_JWT_SECRET_KEY,
        expiresIn: process.env.REFRESH_JWT_EXPIRATION_TIME,
      });

      // Lưu refresh token mới vào cơ sở dữ liệu
      await this.userService.update(user.id, {
        ...user.toObject(),
        refresh_token: newRefreshToken,
      });

      return newRefreshToken;
    }

    return refreshToken;
  }
}
