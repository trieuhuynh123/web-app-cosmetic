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
    const user = await this.userService.findByRefresh_token(token);
    if (!user) {
      throw new UnauthorizedException('Refresh token expired.');
    }
    try {
      const payloadAccess = {
        id: user._id,
        name: user.name,
        email: user.email,
        address: user.address,
      };
      await this.jwtService.verifyAsync(token, {
        secret: process.env.REFRESH_JWT_SECRET_KEY,
      });

      request['access_token'] = await this.jwtService.signAsync(payloadAccess);
    } catch {
      await this.userService.update(user.id, {
        ...user.toObject(),
        refresh_token: '',
      });
      throw new UnauthorizedException('Refresh token expired.');
    }
    return true;
  }
}
