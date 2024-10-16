// review.schema.ts

import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type ReviewDocument = Review & Document;

@Schema({
  timestamps: true,
  toJSON: {
    virtuals: true, // Bật các virtual fields
    versionKey: false, // Loại bỏ __v
    transform: (doc, ret) => {
      ret.id = ret._id; // Thêm trường id từ _id
      delete ret._id; // Xóa trường _id
    },
  },
})
export class Review {
  @Prop({ required: true, type: String, ref: 'User' }) // Liên kết tới người dùng
  user: string;

  @Prop({ required: true, type: String, ref: 'Product' }) // Liên kết tới sản phẩm
  product: string;

  @Prop({ required: true, min: 1, max: 5 }) // Số sao từ 1-5
  rating: number;

  @Prop({ required: true }) // Nội dung bình luận
  comment: string;
}

export const ReviewEntity = SchemaFactory.createForClass(Review);
