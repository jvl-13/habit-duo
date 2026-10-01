/*
  Warnings:

  - A unique constraint covering the columns `[fromUserId,habitId,dayKey]` on the table `Poke` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `dayKey` to the `Poke` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Poke" ADD COLUMN     "dayKey" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Poke_fromUserId_habitId_dayKey_key" ON "Poke"("fromUserId", "habitId", "dayKey");
