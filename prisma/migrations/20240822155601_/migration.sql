-- CreateTable
CREATE TABLE "TelegramBotUser" (
    "id" TEXT NOT NULL,
    "username" TEXT,
    "language_code" TEXT,
    "first_name" TEXT NOT NULL,
    "last_name" TEXT,

    CONSTRAINT "TelegramBotUser_pkey" PRIMARY KEY ("id")
);
