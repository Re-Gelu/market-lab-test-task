export default {
  NODE_ENV: process.env.NODE_ENV || 'development',

  TIMEZONE: 'Europe/Moscow',
  PRODUCTION_DOMAIN: '', // Например google.com

  DATABASE_URL: process.env.DATABASE_URL,

  TELEGRAM_BOT_TOKEN: process.env.TELEGRAM_BOT_TOKEN,
  TELEGRAM_BOT_WEBHOOK_PATH: '/telegram-bot-webhook',

  // API settings
  PORT: process.env.PORT || '8000',
} as const;
