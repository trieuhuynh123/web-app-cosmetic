import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';

import { Model } from 'mongoose';
import { Product } from './entities/product.entity';

@Injectable()
export class ProductService {
  constructor(
    @InjectModel(Product.name) private productModel: Model<Product>,
  ) {}

  async findOne(id: string): Promise<Product> {
    return await this.productModel.findById(id).exec();
  }

  async create(product: Product): Promise<Product> {
    const newProduct = new this.productModel(product);
    return await newProduct.save();
  }

  async update(id: string, product: Product): Promise<Product> {
    return await this.productModel.findByIdAndUpdate(id, product, {
      new: true,
    });
  }

  async findTopSoldProducts(limit: number = 10): Promise<Product[]> {
    return this.productModel.find().sort({ sold: -1 }).limit(limit).exec();
  }

  async filterProductsByCategory(
    categoryId?: string,
    brandId?: string,
    name?: string,
    limit?: number, // Giới hạn số lượng sản phẩm trả về
    offset?: number, // Số lượng sản phẩm bỏ qua (phân trang)
  ): Promise<Product[]> {
    const query: any = {};

    if (categoryId) {
      query.category = categoryId; // Lọc theo category
    }

    if (brandId) {
      query.brand = brandId; // Lọc theo brand
    }

    if (name) {
      query.name = { $regex: name, $options: 'i' }; // Lọc theo tên sản phẩm
    }

    // Thực hiện query với các tham số offset và limit
    return this.productModel
      .find(query)
      .skip(offset || 0) // Bỏ qua số lượng bản ghi tương ứng với offset
      .limit(limit || 10) // Giới hạn số lượng bản ghi trả về (mặc định là 10)
      .exec();
  }

  async getRandomProducts(): Promise<Product[]> {
    const products = await this.productModel.aggregate([
      { $sample: { size: 10 } }, // Lấy ngẫu nhiên 10 sản phẩm
    ]);

    // Ánh xạ để chuyển đổi _id thành id và xóa _id
    return products.map((product) => {
      const { _id, ...rest } = product;
      return {
        id: _id, // Thêm id từ _id
        ...rest,
      };
    });
  }
}
