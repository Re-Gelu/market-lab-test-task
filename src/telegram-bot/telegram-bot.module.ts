import { Module } from '@nestjs/common';

import { TelegramBotService } from './telegram-bot.service';
import { TelegramBotUpdate } from './telegram-bot.update';
import { TelegramBotWizard } from './telegram-bot.wizard';

@Module({
  controllers: [],
  providers: [TelegramBotService, TelegramBotUpdate, TelegramBotWizard],
})
export class TelegramBotModule {}
