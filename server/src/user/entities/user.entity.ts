import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { HydratedDocument, Types } from 'mongoose';

export type UserDocument = HydratedDocument<User>;

@Schema({
  toJSON: {
    virtuals: true, // Bật các virtual fields
    versionKey: false, // Loại bỏ __v
    transform: (doc, ret) => {
      ret.id = ret._id; // Thêm trường id từ _id
      delete ret._id; // Xóa trường _id
      delete ret.password; // Xóa password khi trả về JSON
    },
  },
})
export class User {
  @Prop({ required: true })
  name: string;

  @Prop({ required: true, unique: true })
  email: string;

  @Prop({ required: true })
  password: string;

  @Prop()
  address: string;

  @Prop({ default: false }) // Giá trị mặc định là `false`
  isAdmin: boolean;

  @Prop()
  refresh_token: string;
}

export const UserEntity = SchemaFactory.createForClass(User);
