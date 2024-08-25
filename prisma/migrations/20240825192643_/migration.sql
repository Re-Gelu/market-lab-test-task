/*
  Warnings:

  - The primary key for the `TelegramBotUser` table will be changed. If it partially fails, the table could be left without primary key constraint.

*/
-- DropForeignKey
ALTER TABLE "Link" DROP CONSTRAINT "Link_userId_fkey";

-- AlterTable
ALTER TABLE "Link" ALTER COLUMN "userId" SET DATA TYPE BIGINT;

-- AlterTable
ALTER TABLE "TelegramBotUser" DROP CONSTRAINT "TelegramBotUser_pkey",
ALTER COLUMN "id" SET DATA TYPE BIGINT,
ADD CONSTRAINT "TelegramBotUser_pkey" PRIMARY KEY ("id");

-- AddForeignKey
ALTER TABLE "Link" ADD CONSTRAINT "Link_userId_fkey" FOREIGN KEY ("userId") REFERENCES "TelegramBotUser"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
