import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { OrderDetail, OrderDetailSchema } from './order-detail.entity';
import { User } from '../../user/entities/user.entity';

export type OrderDocument = HydratedDocument<Order>;

export enum PaymentMethod {
  COD = 'COD',
  MOMO = 'MOMO',
  // Có thể thêm các phương thức khác ở đây
}

export enum OrderStatus {
  PENDING = 'PENDING',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
}

@Schema({
  timestamps: true, // Tự động thêm createdAt và updatedAt
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
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  user: User | string;

  @Prop({ type: [OrderDetailSchema], required: true })
  orderDetails: OrderDetail[];

  @Prop({ required: true })
  totalAmount: number;

  @Prop({ required: true, enum: PaymentMethod })
  paymentMethod: PaymentMethod;

  @Prop({ enum: OrderStatus, default: OrderStatus.PENDING })
  status: OrderStatus;

  @Prop()
  momoPaymentUrl?: string; // URL thanh toán Momo
}

export const OrderSchema = SchemaFactory.createForClass(Order);
