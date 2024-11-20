import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import { OrderDetail, OrderDetailEntity } from './order-detail.entity';
export enum OrderStatus {
  NEW = 'new', // Đơn hàng mới
  CONFIRMED = 'confirmed', // Đã xác nhận
  PREPARING = 'preparing', // Đang chuẩn bị hàng
  SHIPPING = 'shipping', // Đang giao hàng
  DELIVERED = 'delivered', // Đã giao thành công
  CANCELLED = 'cancelled', // Hủy đơn hàng
}

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

  @Prop({ required: true, default: Date.now })
  createDate: Date;

  @Prop({ required: true })
  totalAmount: number;

  @Prop({ type: [OrderDetailEntity] })
  orderDetails: string[];

  @Prop({ enum: OrderStatus, default: OrderStatus.NEW })
  status: OrderStatus;
}

export const OrderEntity = SchemaFactory.createForClass(Order);
