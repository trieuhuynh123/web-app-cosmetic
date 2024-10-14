// src/cart/cart.module.ts

import { Module } from '@nestjs/common';
import { CartService } from './cart.service';
import { CartController } from './cart.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Cart, CartSchema } from './schemas/cart.schema';
import { ProductModule } from '../product/product.module';
// import { AuthModule } from '../auth/auth.module'; // Không cần thiết nếu AuthModule là @Global()

@Module({
    imports: [
        MongooseModule.forFeature([{ name: Cart.name, schema: CartSchema }]),
        ProductModule,
        // AuthModule, // Có thể bỏ qua
    ],
    providers: [CartService],
    controllers: [CartController],
    exports: [CartService], // **Thêm dòng này để export CartService**
})
export class CartModule { }
