// src/order/order.service.ts

import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { Model } from 'mongoose';
import { Order } from './entities/order.entity';
import { InjectModel } from '@nestjs/mongoose';
import { Product, ProductDocument } from 'src/product/entities/product.entity';
import { CartService } from '../cart/cart.service';
import { PaymentMethod } from './enums/payment-method.enum';
import { CartDocument } from '../cart/schemas/cart.schema';
import * as QRCode from 'qrcode';

@Injectable()
export class OrderService {
  constructor(
    @InjectModel(Order.name) private orderModel: Model<Order>,
    @InjectModel(Product.name) private productModel: Model<ProductDocument>,
    private readonly cartService: CartService, // Inject CartService
  ) { }

  // Kiểm tra sản phẩm đã mua
  async hasPurchasedProduct(
    userId: string,
    productId: string,
  ): Promise<boolean> {
    const order = await this.orderModel
      .findOne({
        user: userId,
        'orderDetails.product': productId,
      })
      .exec();

    return !!order;
  }

  // Thực hiện thanh toán (checkout)
  async checkout(userId: string, paymentMethod: PaymentMethod): Promise<{ order: Order, qrCode?: string }> {
    // Lấy giỏ hàng của người dùng
    const cart: CartDocument = await this.cartService.getCartByUserId(userId);
    if (cart.items.length === 0) {
      throw new NotFoundException('Giỏ hàng đang trống');
    }

    let totalAmount = 0;
    const orderDetails = [];

    for (const item of cart.items) {
      const product = await this.productModel.findById(item.product).exec();
      if (!product) {
        throw new NotFoundException(`Không tìm thấy sản phẩm với ID ${item.product}`);
      }

      const totalPriceForItem = product.price * item.quantity;
      totalAmount += totalPriceForItem;

      orderDetails.push({
        product: product.id,
        price: product.price,
        quantity: item.quantity,
      });
    }

    // Tạo đơn hàng mới
    const newOrder = new this.orderModel({
      user: userId,
      purchaseDate: new Date(),
      totalAmount,
      orderDetails,
      paymentMethod,
      isPaid: paymentMethod === PaymentMethod.COD ? false : false, // COD không thanh toán ngay
    });

    await newOrder.save();

    // Xóa giỏ hàng sau khi đặt hàng
    await this.cartService.clearCart(userId);

    if (paymentMethod === PaymentMethod.QR) {
      // Tạo URL thanh toán và mã QR
      const paymentUrl = `https://payment.example.com/pay?orderId=${newOrder.id}&amount=${newOrder.totalAmount}`;
      const qrCodeDataURL = await QRCode.toDataURL(paymentUrl);
      return { order: newOrder, qrCode: qrCodeDataURL };
    }

    return { order: newOrder };
  }

  // Xác nhận thanh toán qua QR
  async confirmPayment(orderId: string): Promise<Order> {
    const order = await this.orderModel.findById(orderId).exec();
    if (!order) {
      throw new NotFoundException(`Không tìm thấy đơn hàng với ID ${orderId}`);
    }

    if (order.paymentMethod !== PaymentMethod.QR) {
      throw new BadRequestException('Đơn hàng không phải là phương thức thanh toán QR');
    }

    if (order.isPaid) {
      throw new BadRequestException('Đơn hàng đã được thanh toán');
    }

    // Ở đây bạn sẽ tích hợp với cổng thanh toán để xác nhận thanh toán
    // Ví dụ đơn giản là đánh dấu là đã thanh toán
    order.isPaid = true;
    await order.save();

    return order;
  }

  // Cập nhật thông tin giao hàng
  async updateDeliveryDetails(orderId: string, deliveryDetails: { recipientName: string; recipientPhone: string; deliveryAddress: string }): Promise<Order> {
    const order = await this.orderModel.findById(orderId).exec();
    if (!order) {
      throw new NotFoundException(`Không tìm thấy đơn hàng với ID ${orderId}`);
    }

    // Kiểm tra xem đơn hàng đã được thanh toán nếu là QR hoặc COD đã xác nhận
    if (order.paymentMethod === PaymentMethod.QR && !order.isPaid) {
      throw new BadRequestException('Đơn hàng chưa được thanh toán');
    }

    // Cập nhật thông tin giao hàng
    order.recipientName = deliveryDetails.recipientName;
    order.recipientPhone = deliveryDetails.recipientPhone;
    order.deliveryAddress = deliveryDetails.deliveryAddress;

    // Nếu là COD và đã nhập thông tin giao hàng, đánh dấu là đã thanh toán
    if (order.paymentMethod === PaymentMethod.COD) {
      order.isPaid = true;
    }

    await order.save();

    return order;
  }
}
