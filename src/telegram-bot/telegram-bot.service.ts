import { ExtraEditMessageText } from 'telegraf/typings/telegram-types';

import { Injectable } from '@nestjs/common';

import { TelegramContext } from './telegram-context.type';

@Injectable()
export class TelegramBotService {
  /** Избавляемся от спама сообщений, путем изменения прошлого текстового сообщения */
  async replyOrEditWithHTML(
    context: TelegramContext,
    html: string,
    extra?: ExtraEditMessageText,
  ) {
    try {
      return await context.editMessageText(html, {
        ...extra,
        parse_mode: 'HTML',
      });
    } catch {
      return await context.replyWithHTML(html, extra);
    }
  }
}
