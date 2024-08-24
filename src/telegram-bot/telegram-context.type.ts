import { WizardContext } from 'telegraf/typings/scenes';

export type TelegramContext = WizardContext & {
  wizard: { state: { data: Record<string, string | undefined> } };
  message: { text?: string };
  callbackQuery: { data: string };
  match: string[];
};
