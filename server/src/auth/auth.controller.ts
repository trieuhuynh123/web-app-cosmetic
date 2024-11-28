import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Request,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from './auth.guard';
import { AuthService } from './auth.service';
import { RefreshAuthGuard } from './refresh-auth.guard';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @HttpCode(HttpStatus.OK)
  @Post('login')
  signIn(@Body() signInDto: Record<string, any>) {
    return this.authService.signIn(signInDto.email, signInDto.password);
  }

  @HttpCode(HttpStatus.OK)
  @Post('login-admin')
  signInAdmin(@Body() signInDto: Record<string, any>) {
    return this.authService.signInAdmin(signInDto.email, signInDto.password);
  }

  @UseGuards(AuthGuard)
  @Get('profile')
  getProfile(@Request() req) {
    return req.user;
  }

  @UseGuards(RefreshAuthGuard)
  @Post('refresh')
  refresh(@Request() req) {
    return req.access_token;
  }

  @Post('forgot-password')
  async forgotPassword(@Body('email') email: string) {
    return this.authService.forgotPassword(email);
  }

  @Post('reset-password')
  async resetPassword(
    @Body('otp') otp: string,
    @Body('newPassword') newPassword: string,
    @Body('otpToken') otpToken: string,
  ) {
    return this.authService.resetPassword(otp, newPassword, otpToken);
  }
}
