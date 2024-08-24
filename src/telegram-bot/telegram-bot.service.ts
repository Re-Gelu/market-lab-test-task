import { PrismaService } from 'nestjs-prisma';
import {
  Action,
  Context,
  Hears,
  Message,
  On,
  Start,
  Update,
} from 'nestjs-telegraf';
import { Markup } from 'telegraf';

import { Injectable } from '@nestjs/common';

import { TelegramBotWizard } from './telegram-bot.wizard';
import { TelegramContext } from './telegram-context.type';

@Update()
@Injectable()
export class TelegramBotService {
  constructor(private readonly database: PrismaService) {}

  private readonly pageSize = 5;

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

    await context.replyWithHTML(
      `
<b>Привет, ${user.first_name}!</b>

Это бот для хранения ссылок. Посмотри, что ты можешь в меню кнопок снизу!

Если у тебя есть уникальный код ссылки и тебе нужно её получить, то просто отправь его мне текстовым сообщением!
`,
      Markup.keyboard(['➕ Создать ссылку', 'ℹ️ Мои ссылки']).resize(),
    );
  }

  @Hears('➕ Создать ссылку')
  async enterLinkCreationWizard(@Context() context: TelegramContext) {
    await context.scene.enter(TelegramBotWizard.name);
  }

  @Action('wizard_leave')
  async leaveLinkCreationWizard(@Context() context: TelegramContext) {
    await context.scene.leave();
    await context.replyWithHTML(`⚠️ Процесс создания ссылки отменён!`);
  }

  @Hears('ℹ️ Мои ссылки')
  @Action(/links_page_(\d+)/)
  async getUserLinks(
    @Context()
    context: TelegramContext,
  ) {
    const queryPayload = context.match[1];
    const page = Number(queryPayload || 1);

    const [links, totalLinks] = await Promise.all([
      this.database.link.findMany({
        where: { userId: context.from.id },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * this.pageSize,
        take: this.pageSize,
      }),
      this.database.link.count({ where: { userId: context.from.id } }),
    ]);

    if (links.length === 0) {
      await context.replyWithHTML('🚫 Пока тут пусто :D');
      return;
    }

    const totalPages = Math.ceil(totalLinks / this.pageSize);

    const linkButtons = links.map((link) =>
      Markup.button.callback(link.name, `link_${link.id}`),
    );
    const paginationButtons = [];

    if (page > 1) {
      paginationButtons.push(
        Markup.button.callback('⬅️ Назад', `links_page_${page - 1}`),
      );
    }

    if (page < totalPages) {
      paginationButtons.push(
        Markup.button.callback('Вперед ➡️', `links_page_${page + 1}`),
      );
    }

    await context.replyWithHTML(
      `📋 Страница <u><b>${page}</b></u>:`,
      Markup.inlineKeyboard([
        ...linkButtons.map((button) => [button]),
        paginationButtons,
      ]),
    );

    if (queryPayload) {
      await context.deleteMessage();
    }
  }

  @Action(/link_delete_confirmation_(.+)/)
  async deleteUserLinkConfirmation(@Context() context: TelegramContext) {
    const linkId = context.match[1];

    await context.replyWithHTML(
      `⚠️ Вы уверенны что хотите удалить эту ссылку?`,
      Markup.inlineKeyboard([
        Markup.button.callback(`✅ Да`, `link_delete_${linkId}`),
      ]),
    );
  }

  @Action(/link_delete_(.+)/)
  async deleteUserLink(@Context() context: TelegramContext) {
    const linkId = context.match[1];

    const link = await this.database.link.delete({ where: { id: linkId } });

    await context.replyWithHTML(
      `🗑️ <b>Ссылка ${link.name} была успешно удалена!</b>`,
    );

    await context.deleteMessage();
  }

  @Action(/link_(.+)/)
  async getUserLink(@Context() context: TelegramContext) {
    const linkId = context.match[1];

    const link = await this.database.link.findUnique({ where: { id: linkId } });

    if (!link) {
      await context.replyWithHTML(`🚫 Эта ссылка удалена!`);
      return;
    }

    await context.replyWithHTML(
      `
🔑 <b>Уникальный код: <code>${link.id}</code></b>

🏷️ Наименование: ${link.name}
🔗 URL: ${link.url}
      `,
      Markup.inlineKeyboard([
        Markup.button.callback(
          `🗑️ Удалить`,
          `link_delete_confirmation_${link.id}`,
        ),
      ]),
    );
  }

  @On('message')
  async getLink(
    @Context() context: TelegramContext,
    @Message('text') text: string,
  ) {
    const link = await this.database.link.findUnique({ where: { id: text } });

    if (link) {
      await context.replyWithHTML(`
🔑 <b>Ссылка по данному уникальному коду:</b>
  
🏷️ Наименование: ${link.name}
🔗 URL: ${link.url}
`);
      return;
    }

    await context.replyWithHTML(
      `❌ Ошибка! \n\nСсылка с кодом 🔑 <code>${text}</code> не найдена`,
    );
  }
}
