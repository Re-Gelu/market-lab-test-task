import { Module } from '@nestjs/common';

import { TelegramBotService } from './telegram-bot.service';
import { TelegramBotWizard } from './telegram-bot.wizard';

@Module({
  controllers: [],
  providers: [TelegramBotService, TelegramBotWizard],
})
export class TelegramBotModule {}
