import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';

import { Model } from 'mongoose';
import { Brand } from './entities/brand.entity';

@Injectable()
export class BrandService {
  constructor(@InjectModel(Brand.name) private brandModel: Model<Brand>) {}

  async findAll(): Promise<Brand[]> {
    return await this.brandModel.find().exec();
  }

  async findOne(id: string): Promise<Brand> {
    return await this.brandModel.findById(id).exec();
  }

  async create(brand: Brand): Promise<Brand> {
    const newBrand = new this.brandModel(brand);
    return await newBrand.save();
  }

  async update(id: string, brand: Brand): Promise<Brand> {
    return await this.brandModel.findByIdAndUpdate(id, brand, { new: true });
  }
}
