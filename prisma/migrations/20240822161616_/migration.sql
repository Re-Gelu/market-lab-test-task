/*
  Warnings:

  - The primary key for the `TelegramBotUser` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - Changed the type of `id` on the `TelegramBotUser` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- AlterTable
ALTER TABLE "TelegramBotUser" DROP CONSTRAINT "TelegramBotUser_pkey",
DROP COLUMN "id",
ADD COLUMN     "id" INTEGER NOT NULL,
ADD CONSTRAINT "TelegramBotUser_pkey" PRIMARY KEY ("id");

-- CreateTable
CREATE TABLE "URL" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "userId" INTEGER NOT NULL,

    CONSTRAINT "URL_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "URL" ADD CONSTRAINT "URL_userId_fkey" FOREIGN KEY ("userId") REFERENCES "TelegramBotUser"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
