import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { User, UserDocument } from './entities/user.entity';
import { Model } from 'mongoose';

@Injectable()
export class UserService {
  constructor(@InjectModel(User.name) private userModel: Model<User>) {}

  async findByEmail(email: string): Promise<UserDocument | null> {
    return await this.userModel.findOne({ email }).exec();
  }

  async findByRefresh_token(
    refresh_token: string,
  ): Promise<UserDocument | null> {
    return await this.userModel.findOne({ refresh_token }).exec();
  }

  async create(user: User): Promise<User> {
    const existingUser = await this.userModel.findOne({ email: user.email });
    if (existingUser) {
      throw new HttpException(
        'Email đã tồn tại. Vui lòng sử dụng email khác.',
        HttpStatus.CONFLICT,
      );
    }

    const newUser = new this.userModel(user);
    return await newUser.save();
  }

  async update(id: string, user: User): Promise<User> {
    return await this.userModel.findByIdAndUpdate(id, user, { new: true });
  }
  async updatePassword(id: string, newPassword: string): Promise<User> {
    return await this.userModel.findByIdAndUpdate(
      id,
      { password: newPassword },
      { new: true },
    );
  }
}
