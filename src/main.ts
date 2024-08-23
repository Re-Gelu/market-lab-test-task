import { PrismaClientExceptionFilter } from 'nestjs-prisma';
import { getBotToken } from 'nestjs-telegraf';

import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { HttpAdapterHost, NestFactory } from '@nestjs/core';

import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const configService = app.get(ConfigService);
  const { httpAdapter } = app.get(HttpAdapterHost);

  app.useGlobalFilters(new PrismaClientExceptionFilter(httpAdapter));
  app.useGlobalPipes(new ValidationPipe({ whitelist: true }));

  if (configService.get<string>('NODE_ENV') === 'production') {
    const telegramBot = app.get(getBotToken());
    app.use(
      telegramBot.webhookCallback(
        configService.get<string>('TELEGRAM_BOT_WEBHOOK_PATH'),
      ),
    );
  }

  await app.listen(configService.get<string>('API_PORT') || 8000);
}

bootstrap();
