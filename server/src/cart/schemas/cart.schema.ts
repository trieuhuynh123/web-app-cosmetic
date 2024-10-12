// src/cart/schemas/cart.schema.ts

import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

import { CartItem, CartItemSchema } from './cart-item.schema';
import { User } from '../../user/entities/user.entity';

export type CartDocument = Cart & Document;

@Schema()
export class Cart {
    @Prop({ type: Types.ObjectId, ref: 'User', required: true, unique: true })
    user: User | string; // Tham chiếu đến người dùng

    @Prop({ type: [CartItemSchema], default: [] })
    items: CartItem[];
}

export const CartSchema = SchemaFactory.createForClass(Cart);
