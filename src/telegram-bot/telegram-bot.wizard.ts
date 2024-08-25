import { isURL } from 'class-validator';
import { PrismaService } from 'nestjs-prisma';
import { Context, Message, On, Wizard, WizardStep } from 'nestjs-telegraf';
import { Markup } from 'telegraf';

import { TelegramContext } from './telegram-context.type';

@Wizard(TelegramBotWizard.name)
export class TelegramBotWizard {
  constructor(private readonly database: PrismaService) {}

  private readonly inlineKeyboard = Markup.inlineKeyboard([
    Markup.button.callback('⬅️ Отмена', `wizard_leave`),
  ]);

  /** Спрашиваем название ссылки */
  @WizardStep(1)
  async firstStep(@Context() context: TelegramContext) {
    context.wizard.state.data = {};

    await context.replyWithHTML(
      '🏷️ Напишите название ссылки',
      this.inlineKeyboard,
    );
    await context.wizard.next();
  }

  /** Получаем название ссылки и спрашиваем саму ссылку */
  @On('text')
  @WizardStep(2)
  async secondStep(@Context() context: TelegramContext) {
    context.wizard.state.data.name = context.message.text;

    await context.replyWithHTML('🔗 Напишите ссылку', this.inlineKeyboard);
    await context.wizard.next();
  }

  /** Валидируем ссылку и если всё ок, то сохраняем */
  @On('text')
  @WizardStep(3)
  async end(
    @Context() context: TelegramContext,
    @Message('text') text: string,
  ) {
    if (!isURL(text)) {
      await context.replyWithHTML(
        `b>❌ Ошибка! Некорректная ссылка!</b>\n\nНапишите ссылку ещё раз :3`,
        this.inlineKeyboard,
      );

      return;
    }

    context.wizard.state.data.url = text;

    const link = await this.database.link.create({
      data: {
        name: context.wizard.state.data.name,
        url: context.wizard.state.data.url,
        userId: context.from.id,
      },
    });

    await context.replyWithHTML(
      `💾 Ссылка успешно сохранена!\n\n🔑 <b>Уникальный код: <code>${link.id}</code></b>\n\n🏷️ Наименование: ${link.name}\n🔗 URL: ${link.url}`,
    );

    await context.scene.leave();
  }
}
