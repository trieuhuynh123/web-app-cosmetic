// src/order/order.module.ts

import { Module } from '@nestjs/common';
import { OrderService } from './order.service';
import { OrderController } from './order.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Order, OrderEntity } from './entities/order.entity';
import { Product, ProductEntity } from 'src/product/entities/product.entity';
import { AuthModule } from 'src/auth/auth.module';
import { CartModule } from '../cart/cart.module'; // Import CartModule

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Order.name, schema: OrderEntity },
      { name: Product.name, schema: ProductEntity },
    ]),
    AuthModule,
    CartModule, // Thêm CartModule
  ],
  controllers: [OrderController],
  providers: [OrderService],
})
export class OrderModule { }
