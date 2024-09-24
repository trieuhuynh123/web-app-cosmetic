import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UserService } from 'src/user/user.service';

@Injectable()
export class RefreshAuthGuard implements CanActivate {
  constructor(
    private jwtService: JwtService,
    private userService: UserService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();

    const token = request.body.refresh_token;

    if (!token) {
      throw new UnauthorizedException('Refresh token not found');
    }

    try {
      await this.jwtService.verifyAsync(token, {
        secret: process.env.REFRESH_JWT_SECRET_KEY,
      });

      const user = await this.userService.findByRefresh_token(token);
      const payloadAccess = {
        id: user._id,
        name: user.name,
        email: user.email,
      };
      request['access_token'] = await this.jwtService.signAsync(payloadAccess);
    } catch {
      throw new UnauthorizedException('Refresh token expired or invalid');
    }
    return true;
  }
}
