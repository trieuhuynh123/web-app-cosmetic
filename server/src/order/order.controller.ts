import { Body, Controller, Post, Req, UseGuards } from '@nestjs/common';
import { OrderService } from './order.service';
import { AuthGuard } from 'src/auth/auth.guard';
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
}
