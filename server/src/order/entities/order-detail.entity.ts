import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { Product } from '../../product/entities/product.entity';

export type OrderDetailDocument = OrderDetail & Document;

@Schema()
export class OrderDetail {
  @Prop({ type: Types.ObjectId, ref: 'Product', required: true })
  product: Product | string;

  @Prop({ required: true })
  quantity: number;

  @Prop({ required: true })
  price: number; // Giá tại thời điểm đặt hàng
}

export const OrderDetailSchema = SchemaFactory.createForClass(OrderDetail);
