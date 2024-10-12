// src/cart/cart.controller.ts

import { Controller, Get, Post, Patch, Delete, Body, Param, Request, UseGuards } from '@nestjs/common';
import { CartService } from './cart.service';
import { AuthGuard } from '../auth/auth.guard';

@Controller('cart')
@UseGuards(AuthGuard) // Sử dụng AuthGuard
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
        return await this.cartService.addItemToCart(userId, productId, quantity);
    }

    @Patch('update')
    async updateItem(
        @Request() req,
        @Body('productId') productId: string,
        @Body('quantity') quantity: number,
    ) {
        const userId = req.user.id;
        return await this.cartService.updateItemQuantity(userId, productId, quantity);
    }

    @Delete('remove/:productId')
    async removeItem(
        @Request() req,
        @Param('productId') productId: string,
    ) {
        const userId = req.user.id;
        return await this.cartService.removeItemFromCart(userId, productId);
    }
}
