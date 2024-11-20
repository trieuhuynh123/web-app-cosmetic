import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Cart, CartDocument } from './schemas/cart.schema';
import { Model } from 'mongoose';
import { ProductDocument } from 'src/product/entities/product.entity';
import { ProductService } from 'src/product/product.service';

@Injectable()
export class CartService {
  constructor(
    @InjectModel(Cart.name) private cartModel: Model<CartDocument>,
    private productService: ProductService,
  ) {}

  async getCartByUserId(userId: string): Promise<CartDocument> {
    let cart = await this.cartModel
      .findOne({ user: userId })
      .populate('items.product')
      .exec();
    if (!cart) {
      cart = new this.cartModel({
        user: userId,
        items: [],
      });
      await cart.save();
    }
    return cart;
  }

  async addItemToCart(
    userId: string,
    productId: string,
    quantity: number,
  ): Promise<CartDocument> {
    if (quantity <= 0) {
      throw new BadRequestException('Quantity must be greater than zero');
    }
    const cart = await this.getCartByUserId(userId);
    for (const item of cart.items) {
      const product = item.product as ProductDocument;
      if (product._id.toString() === productId) {
        item.quantity += quantity;
        return cart.save();
      }
    }

    const product = await this.productService.findOne(productId);
    cart.items.push({ product: product, quantity });

    await cart.save();
    return cart;
  }

  async updateItemQuantity(
    userId: string,
    productId: string,
    quantity: number,
  ): Promise<CartDocument> {
    const cart = await this.getCartByUserId(userId);
    for (const item of cart.items) {
        const product = item.product as ProductDocument;
        if (product._id.toString() === productId) {
          item.quantity = quantity;
          return cart.save();
        }
      }
    await cart.save();
    return cart;
  }

  async removeItemFromCart(
    userId: string,
    productId: string,
  ): Promise<CartDocument> {
    const cart = await this.getCartByUserId(userId);
    cart.items = cart.items.filter(
        (cartItem) => (cartItem.product as ProductDocument)._id.toString() !== productId
      );
    await cart.save();
    return cart;
  }
}
