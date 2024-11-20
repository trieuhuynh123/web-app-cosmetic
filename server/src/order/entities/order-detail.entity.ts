import { Prop } from '@nestjs/mongoose';

export class OrderDetail {
  @Prop({ type: String, ref: 'Product' })
  product: string;

  @Prop({ required: true })
  price: number;

  @Prop({ required: true })
  quantity: number;
}