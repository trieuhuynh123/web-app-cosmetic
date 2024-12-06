import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Model, Types } from 'mongoose';
import { Order, OrderStatus } from './entities/order.entity';
import { InjectModel } from '@nestjs/mongoose';
import { Product, ProductDocument } from 'src/product/entities/product.entity';
import { CartItem } from 'src/cart/schemas/cart-item.schema';
import { OrderGateway } from './order.gateway';

@Injectable()
export class OrderService {
  constructor(
    @InjectModel(Order.name) private orderModel: Model<Order>,
    @InjectModel(Product.name) private productModel: Model<ProductDocument>,
    private readonly ordersGateway: OrderGateway,
  ) {}

  async hasPurchasedProduct(
    userId: string,
    productId: string,
  ): Promise<boolean> {
    const order = await this.orderModel
      .findOne({
        user: userId,
        'orderDetails.product': productId,
        status: 'delivered',
      })
      .exec();

    return !!order;
  }

  async create(
    userId: string,
    cartItems: CartItem[],
    address: string,
  ): Promise<Order> {
    let totalAmount = 0;
    const orderDetails = [];

    for (const item of cartItems) {
      const product = await this.productModel
        .findById((item.product as ProductDocument).id)
        .exec();
      if (!product) {
        throw new NotFoundException(`Product not found`);
      }

      const totalPriceForItem = product.price * item.quantity; // Tính tổng tiền cho từng mục
      totalAmount += totalPriceForItem;

      // Cập nhật số lượng bán của sản phẩm
      product.sold = (product.sold || 0) + item.quantity;
      await product.save();

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
      address,
      orderDetails, // Chi tiết đơn hàng
    });
    this.ordersGateway.emitOrderCreate(newOrder);

    return newOrder.save(); // Lưu đơn hàng vào cơ sở dữ liệu
  }

  async getAll(userId: string) {
    const filter: any = { user: userId };

    // Fetch all orders
    const orders = await this.orderModel
      .find(filter)
      .populate({
        path: 'orderDetails.product', // Tên trường cần populate
      })
      .exec();

    // Group orders by status and calculate total amount
    const groupedOrders = orders.reduce(
      (
        groups: { [key: string]: { orders: Order[]; totalAmount: number } },
        order,
      ) => {
        const status = order.status; // Assuming Order has a 'status' field
        if (!groups[status]) {
          groups[status] = { orders: [], totalAmount: 0 };
        }

        groups[status].orders.push(order);
        groups[status].totalAmount += order.totalAmount || 0; // Assuming each order has a 'totalAmount' field
        return groups;
      },
      {},
    );

    return groupedOrders;
  }

  async getAllForAdmin() {
    // Fetch all orders
    const orders = await this.orderModel
      .find()
      .populate({
        path: 'orderDetails.product', // Tên trường cần populate
      })
      .exec();

    // Group orders by status and calculate total amount
    const groupedOrders = orders.reduce(
      (groups: { [key: string]: { orders: Order[] } }, order) => {
        const status = order.status; // Assuming Order has a 'status' field
        if (!groups[status]) {
          groups[status] = { orders: [] };
        }

        groups[status].orders.push(order);
        return groups;
      },
      {},
    );

    return groupedOrders;
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

  async update(id: string, status: string) {
    const order = await this.orderModel
      .findById(id)
      .populate('user', 'refresh_token')
      .exec();

    if (!order) {
      throw new Error('Order not found');
    }

    // Cập nhật trạng thái đơn hàng
    order.status = status as OrderStatus;
    await order.save();
    this.ordersGateway.emitOrderUpdate(order);
    return order;
  }
}
