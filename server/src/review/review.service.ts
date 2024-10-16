import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Review, ReviewDocument } from './entities/review.entity';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

@Injectable()
export class ReviewService {
  constructor(
    @InjectModel(Review.name) private reviewModel: Model<ReviewDocument>,
  ) {}
  async create(userId: string, review: Review) {
    const newReview = new this.reviewModel({
      user: userId,
      ...review,
    });
    return newReview.save();
  }
  async findReviewsExcludingUser(userId: string, productId: string) {
    return await this.reviewModel
      .find({
        product: productId,
        user: { $ne: userId }, // Lọc ra đánh giá của người dùng hiện tại
      })
      .populate('user', 'name')
      .exec();
  }

  async findReviewByProductAndUser(
    userId: string,
    productId: string,
  ): Promise<Review> {
    const review = await this.reviewModel
      .findOne({ user: userId, product: productId })
      .exec();
    if (!review) {
      throw new NotFoundException('Không tìm thấy đánh giá');
    }
    return review;
  }
  async remove(id: string, userId: string) {
    const review = await this.reviewModel.findById(id).exec();

    // Kiểm tra nếu review không tồn tại
    if (!review) {
      throw new NotFoundException(`Review with id ${id} not found`);
    }

    // Kiểm tra nếu người dùng hiện tại là chủ sở hữu của review
    if (review.user.toString() !== userId) {
      throw new ForbiddenException('You are not allowed to delete this review');
    }

    // Nếu hợp lệ, tiến hành xóa review
    await this.reviewModel.findByIdAndDelete(id).exec();
  }
}
