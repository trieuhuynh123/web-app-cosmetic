import {
  BadRequestException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { MailService } from 'src/mail/mail.service';
import { UserDocument } from 'src/user/entities/user.entity';
import { UserService } from 'src/user/user.service';

@Injectable()
export class AuthService {
  private otps = new Map<string, string>();
  constructor(
    private userService: UserService,
    private jwtService: JwtService,
    private readonly mailService: MailService,
  ) {}

  async signIn(
    email: string,
    pass: string,
  ): Promise<{ access_token: string; refresh_token: string }> {
    const user = await this.userService.findByEmail(email);
    // Kiểm tra nếu user không tồn tại
    if (!user) {
      throw new UnauthorizedException('User does not exist');
    }

    // Kiểm tra nếu mật khẩu không đúng
    if (user.password !== pass) {
      throw new UnauthorizedException('Incorrect password');
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

  async signInAdmin(email: string, pass: string) {
    const user = await this.userService.findByEmail(email);
    // Kiểm tra nếu user không tồn tại
    if (!user) {
      throw new UnauthorizedException('Email không đúng');
    }

    // Kiểm tra nếu mật khẩu không đúng
    if (user.password !== pass) {
      throw new UnauthorizedException('Sai mật khẩu');
    }

    if (!user.isAdmin) {
      throw new UnauthorizedException('Bạn không phải admin');
    }
    return true;
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

  async forgotPassword(email: string) {
    const user = await this.userService.findByEmail(email);
    if (!user) {
      throw new BadRequestException('User not found');
    }

    const otp = this.generateOtp();
    await this.mailService.sendResetPasswordEmail(email, otp);

    const otpToken = this.jwtService.sign({ email, otp }, { expiresIn: '5m' });
    return { message: 'OTP sent to email', otpToken };
  }

  async resetPassword(otp: string, newPassword: string, otpToken: string) {
    let decoded;
    try {
      decoded = this.jwtService.verify(otpToken); // Kiểm tra token
    } catch (error) {
      // Xử lý các lỗi khi token không hợp lệ hoặc đã hết hạn
      if (error.name === 'TokenExpiredError') {
        throw new UnauthorizedException('OTP token has expired.'); // Token hết hạn
      } else {
        throw new UnauthorizedException('Invalid OTP token.'); // Token không hợp lệ
      }
    }
    if (decoded.otp !== otp) {
      throw new BadRequestException('Invalid OTP');
    }

    const user = await this.userService.findByEmail(decoded.email);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    await this.userService.updatePassword(user.id, newPassword);

    return { message: 'Password updated successfully' };
  }
  generateOtp(): string {
    return Math.floor(100000 + Math.random() * 900000).toString(); // Tạo OTP 6 chữ số
  }
}
