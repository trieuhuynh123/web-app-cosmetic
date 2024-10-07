// mail.service.ts
import { Injectable } from '@nestjs/common';
import * as nodemailer from 'nodemailer';

@Injectable()
export class MailService {
  private transporter: nodemailer.Transporter;

  constructor() {
    this.transporter = nodemailer.createTransport({
      service: 'Gmail',
      auth: {
        user: 'bananacosmeticweb@gmail.com',
        pass: 'mnec klrh vmte pisk',
      },
    });
  }

  async sendResetPasswordEmail(email: string, otp: string) {
    const mailOptions = {
      from: 'bananacosmeticweb@gmail.com',
      to: email,
      subject: 'Reset Password',
      html: `<p>You requested a password reset. Click the link below to reset your password:</p>
             <p>${otp}</p>`,
    };

    await this.transporter.sendMail(mailOptions);
  }
}
