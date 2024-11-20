import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Query,
} from '@nestjs/common';
import { ProductService } from './product.service';
import { Product } from './entities/product.entity';

@Controller('products')
export class ProductController {
  constructor(private readonly productService: ProductService) {}

  @Post()
  create(@Body() product: Product) {
    return this.productService.create(product);
  }

  @Get('top-sold')
  async findTopSold(@Query('limit') limit?: number): Promise<Product[]> {
    return this.productService.findTopSoldProducts(limit);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateProductDto: Product) {
    return this.productService.update(id, updateProductDto);
  }

  @Get('random')
  async getRandomProducts(): Promise<Product[]> {
    return this.productService.getRandomProducts();
  }

  @Get('search')
  async filterProducts(
    @Query('categoryId') categoryId?: string,
    @Query('brandId') brandId?: string,
    @Query('name') name?: string,
    @Query('limit') limit?: number, // Giới hạn số lượng sản phẩm trả về
    @Query('offset') offset?: number,
  ): Promise<Product[]> {
    return this.productService.filterProductsByCategory(
      categoryId,
      brandId,
      name,
      limit,
      offset,
    );
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.productService.findOne(id);
  }
}
