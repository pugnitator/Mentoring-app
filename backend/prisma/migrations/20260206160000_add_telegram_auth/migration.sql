-- AlterTable
ALTER TABLE "User" ADD COLUMN "telegramId" BIGINT;

-- AlterTable
ALTER TABLE "NotificationSettings" ADD COLUMN "telegramChatId" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "User_telegramId_key" ON "User"("telegramId");
