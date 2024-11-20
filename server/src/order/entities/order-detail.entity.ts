import { Prop } from '@nestjs/mongoose';
import { Product } from 'src/product/entities/product.entity';

export class OrderDetail {
  @Prop({ type: String, ref: 'Product' })
  product: Product;

  @Prop({ required: true })
  price: number;

  @Prop({ required: true })
  quantity: number;
}
