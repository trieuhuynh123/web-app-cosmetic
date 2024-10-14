import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { Order, OrderDocument, PaymentMethod, OrderStatus } from './entities/order.entity';
import { CartService } from '../cart/cart.service';
import { MomoService } from './momo.service';
import { CartItem } from '../cart/schemas/cart-item.schema';

@Injectable()
export class OrderService {
  constructor(
    @InjectModel(Order.name) private orderModel: Model<OrderDocument>,
    private cartService: CartService,
    private momoService: MomoService,
  ) { }

  // Tạo đơn hàng từ giỏ hàng
  async createOrder(userId: string, paymentMethod: PaymentMethod): Promise<Order> {
    // Lấy giỏ hàng của người dùng
    const cart = await this.cartService.getCartByUserId(userId);
    if (!cart || cart.items.length === 0) {
      throw new BadRequestException('Giỏ hàng của bạn đang trống.');
    }

    // Chuyển đổi CartItems thành OrderDetails
    const orderDetails: CartItem[] = cart.items.map(item => ({
      product: typeof item.product === 'string' ? item.product : item.product._id.toString(),
      quantity: item.quantity,
      price: typeof item.product === 'string' ? 0 : item.product.price,
    }));

    // Tính tổng tiền
    const totalAmount = cart.items.reduce((sum, item) => {
      const price = typeof item.product === 'string' ? 0 : item.product.price;
      return sum + price * item.quantity;
    }, 0);

    // Tạo đơn hàng mới
    const newOrder = new this.orderModel({
      user: userId,
      orderDetails,
      totalAmount,
      paymentMethod,
      status: OrderStatus.PENDING,
    });

    // Nếu phương thức thanh toán là Momo, tạo URL thanh toán
    if (paymentMethod === PaymentMethod.MOMO) {
      const momoPaymentUrl = await this.momoService.createPayment(newOrder);
      newOrder.momoPaymentUrl = momoPaymentUrl;
    }

    // Lưu đơn hàng vào cơ sở dữ liệu
    await newOrder.save();

    // Xóa giỏ hàng sau khi đặt hàng thành công
    await this.cartService.clearCart(userId);

    return newOrder;
  }

  // Lấy đơn hàng theo ID
  async findOrderById(orderId: string): Promise<Order> {
    const order = await this.orderModel.findById(orderId).populate('orderDetails.product').exec();
    if (!order) {
      throw new NotFoundException('Không tìm thấy đơn hàng.');
    }
    return order;
  }

  // Xử lý thông báo IPN từ Momo
  async handleMomoIpn(data: any): Promise<void> {
    const { orderId, status } = data;
    const order = await this.orderModel.findById(orderId).exec();
    if (!order) {
      throw new NotFoundException('Đơn hàng không tồn tại.');
    }

    if (status === 'SUCCESS') {
      order.status = OrderStatus.COMPLETED;
      // Có thể cập nhật thêm các thông tin khác nếu cần
    } else {
      order.status = OrderStatus.CANCELLED;
    }

    await order.save();
  }

  // Kiểm tra sản phẩm đã mua
  async hasPurchasedProduct(userId: string, productId: string): Promise<boolean> {
    const order = await this.orderModel
      .findOne({
        user: userId,
        'orderDetails.product': productId,
      })
      .exec();

    return !!order;
  }
}
