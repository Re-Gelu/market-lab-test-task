/*
  Warnings:

  - You are about to drop the `URL` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "URL" DROP CONSTRAINT "URL_userId_fkey";

-- DropTable
DROP TABLE "URL";

-- CreateTable
CREATE TABLE "Url" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "userId" INTEGER NOT NULL,

    CONSTRAINT "Url_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Url" ADD CONSTRAINT "Url_userId_fkey" FOREIGN KEY ("userId") REFERENCES "TelegramBotUser"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
