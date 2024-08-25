export default {
  NODE_ENV: process.env.NODE_ENV || 'development',

  TIMEZONE: 'Europe/Moscow',

  DATABASE_URL: process.env.DATABASE_URL,

  PRODUCTION_DOMAIN: process.env.PRODUCTION_DOMAIN, // Например google.com

  TELEGRAM_BOT_WEBHOOK_PATH: '/telegram-bot-webhook',
  TELEGRAM_BOT_TOKEN: process.env.TELEGRAM_BOT_TOKEN,

  PAGE_SIZE: 5,

  PORT: process.env.PORT || '8000',
} as const;
