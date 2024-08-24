import { InjectBot } from 'nestjs-telegraf';
import { Telegraf } from 'telegraf';

import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  constructor(@InjectBot() private telegramBot: Telegraf) {}

  async getBotInfo() {
    return this.telegramBot.botInfo;
  }
}
