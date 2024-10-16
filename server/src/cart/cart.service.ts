import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Cart, CartDocument } from './schemas/cart.schema';
import { Model } from 'mongoose';

@Injectable()
export class CartService {
    constructor(
        @InjectModel(Cart.name) private cartModel: Model<CartDocument>,
    ) { }

    // Lấy giỏ hàng của người dùng
    async getCartByUserId(userId: string): Promise<CartDocument> {
        let cart = await this.cartModel.findOne({ user: userId }).populate('items.product').exec();
        if (!cart) {
            // Nếu chưa có giỏ hàng, tạo mới
            cart = new this.cartModel({
                user: userId,
                items: [],
            });
            await cart.save();
        }
        return cart;
    }

    // Thêm sản phẩm vào giỏ hàng
    async addItemToCart(userId: string, productId: string, quantity: number): Promise<CartDocument> {
        const cart = await this.getCartByUserId(userId);

        const existingItemIndex = cart.items.findIndex(
            (item) => item.product.toString() === productId,
        );

        if (existingItemIndex > -1) {
            // Nếu sản phẩm đã tồn tại trong giỏ hàng, cập nhật số lượng
            cart.items[existingItemIndex].quantity += quantity;
        } else {
            // Nếu không, thêm sản phẩm mới
            cart.items.push({
                product: productId,
                quantity,
            });
        }

        await cart.save();
        return cart;
    }

    // Cập nhật số lượng sản phẩm trong giỏ hàng
    async updateItemQuantity(userId: string, productId: string, quantity: number): Promise<CartDocument> {
        const cart = await this.getCartByUserId(userId);

        const existingItemIndex = cart.items.findIndex(
            (item) => item.product.toString() === productId,
        );

        if (existingItemIndex > -1) {
            cart.items[existingItemIndex].quantity = quantity;
            if (quantity <= 0) {
                cart.items.splice(existingItemIndex, 1);
            }
        } else {
            throw new NotFoundException('Sản phẩm không tồn tại trong giỏ hàng');
        }

        await cart.save();
        return cart;
    }

    // Xóa sản phẩm khỏi giỏ hàng
    async removeItemFromCart(userId: string, productId: string): Promise<CartDocument> {
        const cart = await this.getCartByUserId(userId);

        cart.items = cart.items.filter(
            (item) => item.product.toString() !== productId,
        );

        await cart.save();
        return cart;
    }
    async clearCart(userId: string): Promise<CartDocument> {
        const cart = await this.getCartByUserId(userId);
        cart.items = [];
        await cart.save();
        return cart;
    }
}
