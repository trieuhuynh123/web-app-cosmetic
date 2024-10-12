import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import { OrderDetail } from './order-detail.entity';

export type OrderDocument = HydratedDocument<Order>;

@Schema({
  toJSON: {
    virtuals: true, // Bật các virtual fields
    versionKey: false, // Loại bỏ __v
    transform: (doc, ret) => {
      ret.id = ret._id; // Thêm trường id từ _id
      delete ret._id; // Xóa trường _id
    },
  },
})
export class Order {
  @Prop({ type: String, ref: 'User' })
  user: string;

  @Prop({ required: true })
  purchaseDate: Date;

  @Prop({ required: true })
  totalAmount: number;

  @Prop({ type: OrderDetail, ref: 'OrderDetail' })
  orderDetails: string[];
}

export const OrderEntity = SchemaFactory.createForClass(Order);
