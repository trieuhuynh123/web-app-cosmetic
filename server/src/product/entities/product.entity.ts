import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type ProductDocument = HydratedDocument<Product>;

@Schema({
  toJSON: {
    virtuals: true, // Bật các virtual fields
    versionKey: false, // Loại bỏ __v
    transform: (doc, ret) => {
      ret.id = ret._id; // Thêm trường id từ _id
      delete ret._id; // Xóa trường _id
    },
  },
})
export class Product {
  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  price: number;

  // Sửa lại kiểu dữ liệu của category và loại bỏ ref
  @Prop({ required: true, ref: 'Category' })
  category: string;

  // Sửa lại kiểu dữ liệu của brand và loại bỏ ref
  @Prop({ required: true, ref: 'Brand' })
  brand: string;

  @Prop({ default: 0 })
  sold: number;

  @Prop({ required: true })
  image: string;

  @Prop({ required: false })
  description: string; // Thêm nếu cần
}

export const ProductEntity = SchemaFactory.createForClass(Product);
