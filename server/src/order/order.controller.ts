import {
  Body,
  Controller,
  Get,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { OrderService } from './order.service';
import { AuthGuard } from 'src/auth/auth.guard';
import { OrderStatus } from './entities/order.entity';
interface LineItem {
  productId: string; // ID của sản phẩm
  quantity: number; // Số lượng của sản phẩm
}

@Controller('orders')
export class OrderController {
  constructor(private readonly orderService: OrderService) {}

  @UseGuards(AuthGuard)
  @Post()
  async createOrder(@Req() req, @Body() lineitems: LineItem[]) {
    const userId = req.user.id;
    return this.orderService.create(userId, lineitems);
  }

  @UseGuards(AuthGuard)
  @Post('check-purchase')
  async checkPurchasedProduct(
    @Req() req,
    @Body('productId') productId: string,
  ): Promise<{ purchased: boolean }> {
    const userId = req.user.id;
    const hasPurchased = await this.orderService.hasPurchasedProduct(
      userId,
      productId,
    );
    return { purchased: hasPurchased };
  }

  @UseGuards(AuthGuard)
  @Get()
  async filterOrders(
    @Req() req, // Lấy thông tin người dùng từ JWT
  ) {
    const userId = req.user.id; // Lấy userId từ token JWT
    return this.orderService.getAll(userId);
  }

  @UseGuards(AuthGuard)
  @Post('cancel')
  async cancelOrders(
    @Req() req, // Lấy thông tin người dùng từ JWT
    @Body('orderId') orderId: string, // Lọc theo status, nếu có
  ) {
    const userId = req.user.id; // Lấy userId từ token JWT
    return this.orderService.cancelOrder(orderId, userId);
  }
}
