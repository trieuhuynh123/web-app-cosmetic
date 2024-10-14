import { Controller, Post, Body, Req, UseGuards, Get, Param, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { OrderService } from './order.service';
import { AuthGuard } from 'src/auth/auth.guard';
import { PaymentMethod } from './entities/order.entity';

@Controller('orders')
@UseGuards(AuthGuard)
export class OrderController {
  constructor(private readonly orderService: OrderService) { }

  // Endpoint để tạo đơn hàng từ giỏ hàng với phương thức thanh toán
  @Post('checkout')
  async checkout(
    @Req() req,
    @Body('paymentMethod') paymentMethod: PaymentMethod,
  ) {
    const userId = req.user.id;

    // Kiểm tra phương thức thanh toán hợp lệ
    if (!Object.values(PaymentMethod).includes(paymentMethod)) {
      throw new BadRequestException('Phương thức thanh toán không hợp lệ.');
    }

    const order = await this.orderService.createOrder(userId, paymentMethod);

    return order;
  }

  // Endpoint để lấy thông tin đơn hàng theo ID
  @Get(':id')
  async getOrder(@Param('id') id: string, @Req() req) {
    const userId = req.user.id;
    const order = await this.orderService.findOrderById(id);
    if (order.user.toString() !== userId) {
      throw new UnauthorizedException('Bạn không có quyền xem đơn hàng này.');
    }
    return order;
  }

  // Endpoint để xử lý IPN từ Momo
  @Post('momo/ipn')
  async handleMomoIpn(@Body() data: any) {
    await this.orderService.handleMomoIpn(data);
    return { success: true };
  }



  // Endpoint để kiểm tra sản phẩm đã mua
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
