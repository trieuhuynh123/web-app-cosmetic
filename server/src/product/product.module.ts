import { Module } from '@nestjs/common';
import { ProductService } from './product.service';
import { ProductController } from './product.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Product, ProductEntity } from './entities/product.entity';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Product.name, schema: ProductEntity }]),
  ],
  controllers: [ProductController],
  providers: [ProductService],
})
export class ProductModule {}
