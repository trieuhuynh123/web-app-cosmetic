// src/cart/cart.controller.ts
import { Controller, Get, Post, Patch, Delete, Body, Param, Request, UseGuards, HttpException, HttpStatus } from '@nestjs/common';
import { CartService } from './cart.service';
import { AuthGuard } from '../auth/auth.guard';

@Controller('cart')
@UseGuards(AuthGuard)
export class CartController {
  constructor(private cartService: CartService) { }

  @Get()
  async getCart(@Request() req) {
    const userId = req.user.id;
    return await this.cartService.getCartByUserId(userId);
  }

  @Post('add')
  async addItem(
    @Request() req,
    @Body('productId') productId: string,
    @Body('quantity') quantity: number,
  ) {
    const userId = req.user.id;
    try {
      return await this.cartService.addItemToCart(userId, productId, quantity);
    } catch (error) {
      throw new HttpException(error.message, error.status || HttpStatus.BAD_REQUEST);
    }
  }

  @Patch('update')
  async updateItem(
    @Request() req,
    @Body('productId') productId: string,
    @Body('quantity') quantity: number,
  ) {
    const userId = req.user.id;
    try {
      return await this.cartService.updateItemQuantity(userId, productId, quantity);
    } catch (error) {
      throw new HttpException(error.message, error.status || HttpStatus.BAD_REQUEST);
    }
  }

  @Delete('remove/:productId')
  async removeItem(
    @Request() req,
    @Param('productId') productId: string,
  ) {
    const userId = req.user.id;
    try {
      return await this.cartService.removeItemFromCart(userId, productId);
    } catch (error) {
      throw new HttpException(error.message, error.status || HttpStatus.BAD_REQUEST);
    }
  }
}
