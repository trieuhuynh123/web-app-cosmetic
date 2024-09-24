import { Controller, Get, Post, Body, Patch, Param } from '@nestjs/common';
import { BrandService } from './brand.service';
import { Brand } from './entities/brand.entity';

@Controller('brands')
export class BrandController {
  constructor(private readonly brandService: BrandService) {}

  @Post()
  create(@Body() brand: Brand) {
    return this.brandService.create(brand);
  }

  @Get()
  findAll() {
    return this.brandService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.brandService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateBrandDto: Brand) {
    return this.brandService.update(id, updateBrandDto);
  }
}
