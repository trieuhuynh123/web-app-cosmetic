import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Model } from 'mongoose';
import { Order, OrderStatus } from './entities/order.entity';
import { InjectModel } from '@nestjs/mongoose';
import { Product, ProductDocument } from 'src/product/entities/product.entity';
interface LineItem {
  productId: string; // ID của sản phẩm
  quantity: number; // Số lượng của sản phẩm
}
@Injectable()
export class OrderService {
  constructor(
    @InjectModel(Order.name) private orderModel: Model<Order>,
    @InjectModel(Product.name) private productModel: Model<ProductDocument>,
  ) {}

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

  async create(userId: string, lineItems: LineItem[]): Promise<Order> {
    let totalAmount = 0;
    const orderDetails = [];

    for (const item of lineItems) {
      const product = await this.productModel.findById(item.productId).exec();
      if (!product) {
        throw new NotFoundException(
          `Product with ID ${item.productId} not found`,
        );
      }

      const totalPriceForItem = product.price * item.quantity; // Tính tổng tiền cho từng mục
      totalAmount += totalPriceForItem;

      // Thêm vào chi tiết đơn hàng
      orderDetails.push({
        product: product.id, // ID sản phẩm
        price: product.price, // Giá sản phẩm
        quantity: item.quantity, // Số lượng sản phẩm
      });
    }

    // Tạo đơn hàng mới
    const newOrder = new this.orderModel({
      user: userId, // ID của người dùng
      totalAmount, // Tổng số tiền
      orderDetails, // Chi tiết đơn hàng
    });

    return newOrder.save(); // Lưu đơn hàng vào cơ sở dữ liệu
  }

  async getOrdersByStatusAndUser(
    userId: string,
    status?: OrderStatus,
  ): Promise<Order[]> {
    const filter: any = { user: userId };

    if (status) {
      filter.status = status;
    }

    return this.orderModel.find(filter).exec();
  }
  async cancelOrder(orderId: string, userId: string): Promise<Order> {
    const order = await this.orderModel.findOne({ id: orderId, user: userId });

    if (!order) {
      throw new BadRequestException(
        'Order not found or you are not authorized to cancel this order.',
      );
    }

    // Kiểm tra nếu đơn hàng đã quá 30 phút
    const now = new Date();
    const orderCreatedTime = new Date(order.createDate);
    const diffInMinutes =
      (now.getTime() - orderCreatedTime.getTime()) / (1000 * 60); // tính thời gian chênh lệch bằng phút

    if (diffInMinutes > 30) {
      throw new BadRequestException(
        'Order cannot be canceled after 30 minutes.',
      );
    }

    // Cập nhật trạng thái đơn hàng thành "canceled"
    order.status = OrderStatus.CANCELLED;
    return order.save(); // Lưu trạng thái mới vào cơ sở dữ liệu
  }
}
