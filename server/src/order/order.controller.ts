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
import { CartItem } from 'src/cart/schemas/cart-item.schema';


@Controller('orders')
export class OrderController {
  constructor(private readonly orderService: OrderService) {}

  @UseGuards(AuthGuard)
  @Post()
  async createOrder(@Req() req, @Body() cartItems: CartItem[]) {
    const userId = req.user.id;
    return this.orderService.create(userId, cartItems);
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
