/*
  Warnings:

  - A unique constraint covering the columns `[habitId,userId,dayKey]` on the table `CheckIn` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `dayKey` to the `CheckIn` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "CheckIn_habitId_date_idx";

-- DropIndex
DROP INDEX "CheckIn_habitId_userId_date_key";

-- AlterTable
ALTER TABLE "CheckIn" ADD COLUMN     "dayKey" TEXT NOT NULL;

-- CreateIndex
CREATE INDEX "CheckIn_habitId_dayKey_idx" ON "CheckIn"("habitId", "dayKey");

-- CreateIndex
CREATE UNIQUE INDEX "CheckIn_habitId_userId_dayKey_key" ON "CheckIn"("habitId", "userId", "dayKey");
