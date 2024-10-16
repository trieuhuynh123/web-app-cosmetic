import {
  Controller,
  Post,
  Body,
  Param,
  Delete,
  Req,
  UseGuards,
  Get,
  Query,
} from '@nestjs/common';
import { ReviewService } from './review.service';
import { Review } from './entities/review.entity';
import { AuthGuard } from 'src/auth/auth.guard';

@Controller('reviews')
export class ReviewController {
  constructor(private readonly reviewService: ReviewService) {}

  @UseGuards(AuthGuard)
  @Post()
  create(@Body() review: Review, @Req() req) {
    const userId = req.user.id;
    return this.reviewService.create(userId, review);
  }

  @UseGuards(AuthGuard)
  @Get('find')
  async findReview(@Query('productId') productId: string, @Req() req) {
    const userId = req.user.id;
    return this.reviewService.findReviewByProductAndUser(userId, productId);
  }

  @UseGuards(AuthGuard)
  @Get('find/others')
  async findOthersReviews(@Query('productId') productId: string, @Req() req) {
    const userId = req.user.id; // Lấy ID của người dùng hiện tại
    return this.reviewService.findReviewsExcludingUser(userId, productId); // Gọi service để tìm đánh giá
  }

  @UseGuards(AuthGuard)
  @Delete(':id')
  async remove(@Param('id') id: string, @Req() req) {
    const userId = req.user.id;
    return this.reviewService.remove(id, userId);
  }
}
