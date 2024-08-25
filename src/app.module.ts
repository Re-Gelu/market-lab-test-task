import { PrismaModule } from 'nestjs-prisma';
import { TelegrafModule } from 'nestjs-telegraf';
import { session } from 'telegraf';

import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';

import { AppController } from './app.controller';
import { AppService } from './app.service';
import configuration from './configuration';
import { TelegramBotModule } from './telegram-bot/telegram-bot.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [() => configuration],
    }),

    PrismaModule.forRoot({
      isGlobal: true,
      prismaServiceOptions: {
        explicitConnect: true,
      },
    }),

    TelegrafModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        token: configService.get<string>('TELEGRAM_BOT_TOKEN'),
        middlewares: [session()],
        launchOptions: {
          webhook:
            configService.get<string>('NODE_ENV') === 'production' &&
            configService.get<string>('PRODUCTION_DOMAIN')
              ? {
                  domain: configService.get<string>('PRODUCTION_DOMAIN'),
                  hookPath: configService.get<string>(
                    'TELEGRAM_BOT_WEBHOOK_PATH',
                  ),
                }
              : undefined,
        },

        include: [],
      }),
      inject: [ConfigService],
    }),

    TelegramBotModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
