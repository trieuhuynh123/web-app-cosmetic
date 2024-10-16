// src/order/entities/order.entity.ts

import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import { OrderDetail } from './order-detail.entity';
import { PaymentMethod } from '../enums/payment-method.enum';

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

  @Prop({ type: [OrderDetail], ref: 'OrderDetail' })
  orderDetails: string[];

  @Prop({ required: true, enum: PaymentMethod })
  paymentMethod: PaymentMethod;

  @Prop({ default: false })
  isPaid: boolean; // Dành cho thanh toán QR

  // Các trường thông tin giao hàng - Không bắt buộc tại thời điểm tạo đơn hàng
  @Prop()
  recipientName?: string;

  @Prop()
  recipientPhone?: string;

  @Prop()
  deliveryAddress?: string;
}

export const OrderEntity = SchemaFactory.createForClass(Order);
