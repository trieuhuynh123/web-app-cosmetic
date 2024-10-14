import { Module } from '@nestjs/common';
import { OrderService } from './order.service';
import { OrderController } from './order.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Order, OrderSchema } from './entities/order.entity';
import { OrderDetail, OrderDetailSchema } from './entities/order-detail.entity';
import { ProductModule } from '../product/product.module';
import { CartModule } from '../cart/cart.module';
import { UserModule } from '../user/user.module';
import { MomoService } from './momo.service';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Order.name, schema: OrderSchema },
      { name: OrderDetail.name, schema: OrderDetailSchema },
    ]),
    ProductModule,
    CartModule,
    UserModule,
    ConfigModule, // Import ConfigModule để sử dụng biến môi trường
  ],
  providers: [OrderService, MomoService],
  controllers: [OrderController],
})
export class OrderModule { }
