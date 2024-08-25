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

import { ConfigService } from '@nestjs/config';

import { TelegramBotService } from './telegram-bot.service';
import { TelegramBotWizard } from './telegram-bot.wizard';
import { TelegramContext } from './telegram-context.type';

@Update()
export class TelegramBotUpdate {
  constructor(
    private readonly database: PrismaService,
    private readonly telegramBotService: TelegramBotService,
    private readonly configService: ConfigService,
  ) {}

  private readonly pageSize = this.configService.get('PAGE_SIZE');

  @Start()
  async start(@Context() context: TelegramContext) {
    // Получить или создать пользователя
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
      `<b>👋 Привет, ${user.first_name}!</b> \n\nЯ бот для удобного хранения и управления твоими ссылками\n\nЕсли у тебя есть уникальный код ссылки, просто отправь его мне, и я покажу, что за ней скрывается! \n\n<b>💡 Взгляни на меню ниже и выбери, что тебе нужно сделать!</b>`,
      Markup.keyboard(['➕ Создать ссылку', 'ℹ️ Мои ссылки']).resize(),
    );
  }

  /** Начало процесса создания ссылки (далее смотреть telegram-bot.wizard.ts) */
  @Hears('➕ Создать ссылку')
  async enterLinkCreationWizard(@Context() context: TelegramContext) {
    await context.scene.enter(TelegramBotWizard.name);
  }

  /** Отмена создания ссылки */
  @Action('wizard_leave')
  async leaveLinkCreationWizard(@Context() context: TelegramContext) {
    await context.scene.leave();

    await this.telegramBotService.replyOrEditWithHTML(
      context,
      `⚠️ Процесс создания ссылки отменён!`,
    );
  }

  /** Вывод списка ссылок с пагинацией */
  @Hears('ℹ️ Мои ссылки')
  @Action(/links_page_(\d+)/)
  async getUserLinks(@Context() context: TelegramContext) {
    const queryPayload = context.match[1];
    const page = Number(queryPayload) || 1;

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
        Markup.button.callback('⬅️', `links_page_${page - 1}`),
      );
    }

    if (page < totalPages) {
      paginationButtons.push(
        Markup.button.callback('➡️', `links_page_${page + 1}`),
      );
    }

    await this.telegramBotService.replyOrEditWithHTML(
      context,
      `📋 Страница <u><b>${page}</b></u>:`,
      Markup.inlineKeyboard([
        ...linkButtons.map((button) => [button]),
        paginationButtons,
      ]),
    );
  }

  /** Подтверждение удаления ссылки */
  @Action(/link_delete_confirmation_(.+)/)
  async deleteUserLinkConfirmation(@Context() context: TelegramContext) {
    const linkId = context.match[1];

    await context.replyWithHTML(
      '⚠️ Вы уверенны что хотите удалить эту ссылку?',
      Markup.inlineKeyboard([
        Markup.button.callback(`✅ Да`, `link_delete_${linkId}`),
        Markup.button.callback(`❌ Нет`, `link_delete_refuse_${linkId}`),
      ]),
    );
  }

  /** Отмена удаления ссылки */
  @Action(/link_delete_refuse_(.+)/)
  async deleteUserLinkRefuse(@Context() context: TelegramContext) {
    await context.answerCbQuery('✅ Операция успешно отменена');
    await context.deleteMessage();
  }

  /** Удаление ссылки */
  @Action(/link_delete_(.+)/)
  async deleteUserLink(@Context() context: TelegramContext) {
    const linkId = context.match[1];

    const link = await this.database.link.delete({ where: { id: linkId } });

    await this.telegramBotService.replyOrEditWithHTML(
      context,
      `🗑️ <b>Ссылка <u>${link.name}</u> была успешно удалена!</b>`,
    );
  }

  /** Вывод конкретной ссылки из списка ссылок */
  @Action(/link_(.+)/)
  async getUserLink(@Context() context: TelegramContext) {
    const linkId = context.match[1];

    const link = await this.database.link.findUnique({ where: { id: linkId } });

    if (!link) {
      await context.replyWithHTML('🚫 Эта ссылка удалена!');
      return;
    }

    await context.replyWithHTML(
      `🔑 <b>Уникальный код: <code>${link.id}</code></b>\n\n🏷️ Наименование: ${link.name}\n🔗 URL: ${link.url}`,
      Markup.inlineKeyboard([
        Markup.button.callback(
          `🗑️ Удалить`,
          `link_delete_confirmation_${link.id}`,
        ),
      ]),
    );
  }

  /** Прослушивание всех сообщений для вывода ссылки по уникальному коду */
  @On('text')
  async getLink(
    @Context() context: TelegramContext,
    @Message('text') text: string,
  ) {
    const link = await this.database.link.findUnique({ where: { id: text } });

    if (!link) {
      await context.replyWithHTML(
        `❌ Ошибка! \n\nСсылка с кодом 🔑 <code>${text}</code> не найдена`,
      );

      return;
    }

    await context.replyWithHTML(
      `🔑 <b>Ссылка по данному уникальному коду:</b>\n\n🏷️ Наименование: ${link.name}\n🔗 URL: ${link.url}`,
    );
  }
}
