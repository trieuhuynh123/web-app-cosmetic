// src/order/order.controller.ts

import { Body, Controller, Post, Req, UseGuards, Patch } from '@nestjs/common';
import { OrderService } from './order.service';
import { AuthGuard } from 'src/auth/auth.guard';
import { PaymentMethod } from './enums/payment-method.enum';

interface CheckoutRequest {
  paymentMethod: PaymentMethod;
}

interface ConfirmPaymentRequest {
  orderId: string;
}

interface DeliveryDetailsRequest {
  orderId: string;
  recipientName: string;
  recipientPhone: string;
  deliveryAddress: string;
}

@Controller('orders')
export class OrderController {
  constructor(private readonly orderService: OrderService) { }

  // Tạo đơn hàng từ giỏ hàng
  @UseGuards(AuthGuard)
  @Post('checkout')
  async checkout(@Req() req, @Body() checkoutRequest: CheckoutRequest) {
    const userId = req.user.id;
    const { paymentMethod } = checkoutRequest;
    const result = await this.orderService.checkout(userId, paymentMethod);
    return result;
  }

  // Xác nhận thanh toán qua QR
  @UseGuards(AuthGuard)
  @Post('confirm-payment')
  async confirmPayment(@Body() confirmPaymentRequest: ConfirmPaymentRequest) {
    const { orderId } = confirmPaymentRequest;
    const order = await this.orderService.confirmPayment(orderId);
    return order;
  }

  // Cập nhật thông tin giao hàng
  @UseGuards(AuthGuard)
  @Patch('delivery-details')
  async updateDeliveryDetails(@Body() deliveryDetailsRequest: DeliveryDetailsRequest) {
    const { orderId, recipientName, recipientPhone, deliveryAddress } = deliveryDetailsRequest;
    const updatedOrder = await this.orderService.updateDeliveryDetails(orderId, {
      recipientName,
      recipientPhone,
      deliveryAddress,
    });
    return updatedOrder;
  }
}
