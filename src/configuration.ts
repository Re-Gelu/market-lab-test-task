export default {
  TIMEZONE: 'Europe/Moscow',

  DATABASE_URL: process.env.DATABASE_URL,

  TELEGRAM_NOTIFICATIONS_BOT_TOKEN:
    process.env.TELEGRAM_NOTIFICATIONS_BOT_TOKEN,
  TELEGRAM_NOTIFICATIONS_BOT_WEBHOOK_PATH: '/notifications-bot',

  // API settings
  API_PORT: process.env.PORT || '8000',
  API_PREFIX: process.env.API_PREFIX || '/api/v1/',

  // .ENV variables
  JWT_SECRET_KEY: 'test',
  NODE_ENV: process.env.NODE_ENV || 'development',
} as const;
