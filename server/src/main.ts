// main.ts (NestJS)
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);
  const port = configService.get<number>('PORT') || 3001;

  app.enableCors({
    origin: 'http://localhost:3000', // Thay đổi URL này theo frontend của bạn
    credentials: true,
  });

  await app.listen(port);
}
bootstrap();
