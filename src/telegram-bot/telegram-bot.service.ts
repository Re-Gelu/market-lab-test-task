import { isURL } from 'class-validator';
import { PrismaService } from 'nestjs-prisma';
import {
  Action,
  Context,
  Hears,
  Help,
  Message,
  On,
  Start,
  Update,
} from 'nestjs-telegraf';
import { Context as _TelegramContext, Markup } from 'telegraf';

import { Injectable } from '@nestjs/common';

type TelegramContext = _TelegramContext & {
  callbackQuery: { data: string };
  match: string[];
};

@Update()
@Injectable()
export class TelegramBotService {
  constructor(private readonly database: PrismaService) {}

  @Start()
  async start(@Context() context: TelegramContext) {
    // Get or create user
    const user = await this.database.telegramBotUser.upsert({
      where: {
        id: context.from.id,
      },
      update: {},
      create: {
        id: context.from.id,
        username: context.from.username,
        language_code: context.from.language_code,
        first_name: context.from.first_name,
        last_name: context.from.last_name,
      },
    });

    await context.reply(
      `Привет ${user.first_name}!`,
      Markup.keyboard(['➕ Создать ссылку', 'ℹ️ Мои ссылки']).resize(),
    );
  }

  // ^\w+ — начало строки с одного или более символов слова (буквы, цифры, подчеркивания).
  // \s+ — один или более пробельных символов (разделяет название и ссылку).
  // \S+ — любая непустая строка после пробела.
  // $ — конец строки.
  @Hears(new RegExp(/^\w+\s+(\S+)$/))
  async createLink(
    @Context() context: TelegramContext,
    @Message('text') text: string,
  ) {
    const preparedText = text.trim().split(' ');
    const data = {
      name: preparedText[0],
      url: preparedText[1],
    };

    if (isURL(data.url)) {
      const link = await this.database.link.create({
        data: {
          ...data,
          userId: context.from.id,
        },
      });

      await context.replyWithHTML(`
✅ Ссылка успешно сохранена!

🔑 <b>Уникальный код: <code>${link.id}</code></b>

🏷️ Наименование: ${link.name}
🔗 URL: ${link.url}
`);
    }
  }

  @Hears('ℹ️ Мои ссылки')
  @Action(/links_page_(\d+)/)
  async getLinks(
    @Context()
    context: TelegramContext & {
      callbackQuery: { data: string };
      match: string[];
    },
  ) {
    const queryPayload = context.match[1];
    const currentPage = Number(queryPayload || 1);
    const limit = 3;

    const links = await this.database.link.findMany({
      where: { userId: context.from.id },
      skip: (currentPage - 1) * limit,
      take: limit,
    });

    if (links.length === 0) {
      await context.replyWithHTML('🚫 Пока тут пусто :D');
      return;
    }

    const totalLinks = await this.database.link.count({
      where: { userId: context.from.id },
    });
    const totalPages = Math.ceil(totalLinks / limit);

    const linkButtons = links.map((link) =>
      Markup.button.callback(link.name, `link_${link.id}`),
    );
    const paginationButtons = [];

    if (currentPage > 1) {
      paginationButtons.push(
        Markup.button.callback('⬅️ Назад', `links_page_${currentPage - 1}`),
      );
    }
    if (currentPage < totalPages) {
      paginationButtons.push(
        Markup.button.callback('Вперед ➡️', `links_page_${currentPage + 1}`),
      );
    }

    await context.replyWithHTML(
      `<b>📋 Страница ${currentPage}:</b>`,
      Markup.inlineKeyboard([
        ...linkButtons.map((button) => [button]),
        paginationButtons,
      ]),
    );

    if (queryPayload) {
      await context.deleteMessage();
    }
  }

  @Action(/link_delete_(.+)/)
  async deleteLink(@Context() context: TelegramContext) {
    const linkId = context.match[1];

    const link = await this.database.link.delete({ where: { id: linkId } });

    await context.replyWithHTML(
      `🗑️ <b>Ссылка ${link.name} была успешно удалена!</b>`,
    );

    await context.deleteMessage();
  }

  @Action(/link_(.+)/)
  async getLink(@Context() context: TelegramContext) {
    const linkId = context.match[1];

    const link = await this.database.link.findUnique({ where: { id: linkId } });

    await context.replyWithHTML(
      `
🔑 <b>Уникальный код: <code>${link.id}</code></b>

🏷️ Наименование: ${link.name}
🔗 URL: ${link.url}
      `,
      Markup.inlineKeyboard([
        Markup.button.callback(`🗑️ Удалить`, `link_delete_${link.id}`),
      ]),
    );
  }
}
