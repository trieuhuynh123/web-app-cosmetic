import { Module } from '@nestjs/common';
import { OrderService } from './order.service';
import { OrderController } from './order.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Order, OrderEntity } from './entities/order.entity';
import { Product, ProductEntity } from 'src/product/entities/product.entity';
import { AuthModule } from 'src/auth/auth.module';
import { OrderGateway } from './order.gateway';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Order.name, schema: OrderEntity },

      { name: Product.name, schema: ProductEntity },
    ]),
    AuthModule,
  ],
  controllers: [OrderController],
  providers: [OrderService, OrderGateway],
})
export class OrderModule {}
