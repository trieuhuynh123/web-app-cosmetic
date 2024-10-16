import { Module } from '@nestjs/common';
import { ReviewService } from './review.service';
import { ReviewController } from './review.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { AuthModule } from 'src/auth/auth.module';
import { Review, ReviewEntity } from './entities/review.entity';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Review.name, schema: ReviewEntity }]),
    AuthModule,
  ],
  controllers: [ReviewController],
  providers: [ReviewService],
})
export class ReviewModule {}
