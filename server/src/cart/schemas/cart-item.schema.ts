// src/cart/schemas/cart-item.schema.ts

import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

import { Product } from '../../product/entities/product.entity';

export type CartItemDocument = CartItem & Document;

@Schema()
export class CartItem {
    @Prop({ type: Types.ObjectId, ref: 'Product', required: true })
    product: Types.ObjectId | Product; // Tham chiếu đến sản phẩm

    @Prop({ required: true, default: 1 })
    quantity: number;
}

export const CartItemSchema = SchemaFactory.createForClass(CartItem);
