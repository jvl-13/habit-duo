/*
  Warnings:

  - You are about to drop the column `imageUrl` on the `CheckIn` table. All the data in the column will be lost.
  - You are about to drop the column `onTime` on the `CheckIn` table. All the data in the column will be lost.
  - You are about to drop the column `pairId` on the `CheckIn` table. All the data in the column will be lost.
  - You are about to drop the column `pairId` on the `Poke` table. All the data in the column will be lost.
  - You are about to drop the column `receiverId` on the `Poke` table. All the data in the column will be lost.
  - You are about to drop the column `senderId` on the `Poke` table. All the data in the column will be lost.
  - You are about to drop the column `revoked` on the `RefreshToken` table. All the data in the column will be lost.
  - You are about to drop the column `token` on the `RefreshToken` table. All the data in the column will be lost.
  - You are about to drop the `HabitPair` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `PairInvite` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `PairMember` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[habitId,userId,date]` on the table `CheckIn` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[tokenHash]` on the table `RefreshToken` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `habitId` to the `CheckIn` table without a default value. This is not possible if the table is not empty.
  - Changed the type of `type` on the `Notification` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Added the required column `fromUserId` to the `Poke` table without a default value. This is not possible if the table is not empty.
  - Added the required column `habitId` to the `Poke` table without a default value. This is not possible if the table is not empty.
  - Added the required column `toUserId` to the `Poke` table without a default value. This is not possible if the table is not empty.
  - Added the required column `tokenHash` to the `RefreshToken` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `User` table without a default value. This is not possible if the table is not empty.
  - Made the column `name` on table `User` required. This step will fail if there are existing NULL values in that column.

*/
-- CreateEnum
CREATE TYPE "DuoStatus" AS ENUM ('PENDING', 'ACTIVE', 'REJECTED', 'ENDED');

-- CreateEnum
CREATE TYPE "HabitFrequency" AS ENUM ('DAILY');

-- CreateEnum
CREATE TYPE "NotificationType" AS ENUM ('CHECKIN_CREATED', 'POKE_RECEIVED', 'DUO_INVITATION');

-- DropForeignKey
ALTER TABLE "CheckIn" DROP CONSTRAINT "CheckIn_pairId_fkey";

-- DropForeignKey
ALTER TABLE "Notification" DROP CONSTRAINT "Notification_userId_fkey";

-- DropForeignKey
ALTER TABLE "PairInvite" DROP CONSTRAINT "PairInvite_pairId_fkey";

-- DropForeignKey
ALTER TABLE "PairInvite" DROP CONSTRAINT "PairInvite_senderId_fkey";

-- DropForeignKey
ALTER TABLE "PairMember" DROP CONSTRAINT "PairMember_pairId_fkey";

-- DropForeignKey
ALTER TABLE "PairMember" DROP CONSTRAINT "PairMember_userId_fkey";

-- DropForeignKey
ALTER TABLE "Poke" DROP CONSTRAINT "Poke_pairId_fkey";

-- DropForeignKey
ALTER TABLE "RefreshToken" DROP CONSTRAINT "RefreshToken_userId_fkey";

-- DropIndex
DROP INDEX "CheckIn_pairId_userId_date_key";

-- DropIndex
DROP INDEX "Poke_pairId_senderId_createdAt_idx";

-- DropIndex
DROP INDEX "RefreshToken_token_key";

-- AlterTable
ALTER TABLE "CheckIn" DROP COLUMN "imageUrl",
DROP COLUMN "onTime",
DROP COLUMN "pairId",
ADD COLUMN     "habitId" TEXT NOT NULL,
ADD COLUMN     "photoUrl" TEXT;

-- AlterTable
ALTER TABLE "Notification" DROP COLUMN "type",
ADD COLUMN     "type" "NotificationType" NOT NULL;

-- AlterTable
ALTER TABLE "Poke" DROP COLUMN "pairId",
DROP COLUMN "receiverId",
DROP COLUMN "senderId",
ADD COLUMN     "fromUserId" TEXT NOT NULL,
ADD COLUMN     "habitId" TEXT NOT NULL,
ADD COLUMN     "toUserId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "RefreshToken" DROP COLUMN "revoked",
DROP COLUMN "token",
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "revokedAt" TIMESTAMP(3),
ADD COLUMN     "tokenHash" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "avatarUrl" TEXT,
ADD COLUMN     "lastSeenAt" TIMESTAMP(3),
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL,
ALTER COLUMN "name" SET NOT NULL;

-- DropTable
DROP TABLE "HabitPair";

-- DropTable
DROP TABLE "PairInvite";

-- DropTable
DROP TABLE "PairMember";

-- DropEnum
DROP TYPE "InviteStatus";

-- DropEnum
DROP TYPE "NotifType";

-- DropEnum
DROP TYPE "PairRole";

-- DropEnum
DROP TYPE "PairStatus";

-- CreateTable
CREATE TABLE "Duo" (
    "id" TEXT NOT NULL,
    "status" "DuoStatus" NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Duo_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DuoMember" (
    "duoId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "joinedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "DuoMember_pkey" PRIMARY KEY ("duoId","userId")
);

-- CreateTable
CREATE TABLE "Habit" (
    "id" TEXT NOT NULL,
    "duoId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "frequency" "HabitFrequency" NOT NULL DEFAULT 'DAILY',
    "deadline" TEXT,
    "startDate" TIMESTAMP(3) NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Habit_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "CheckIn_habitId_date_idx" ON "CheckIn"("habitId", "date");

-- CreateIndex
CREATE UNIQUE INDEX "CheckIn_habitId_userId_date_key" ON "CheckIn"("habitId", "userId", "date");

-- CreateIndex
CREATE INDEX "Notification_userId_read_idx" ON "Notification"("userId", "read");

-- CreateIndex
CREATE INDEX "Poke_toUserId_createdAt_idx" ON "Poke"("toUserId", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "RefreshToken_tokenHash_key" ON "RefreshToken"("tokenHash");

-- CreateIndex
CREATE INDEX "RefreshToken_userId_idx" ON "RefreshToken"("userId");

-- AddForeignKey
ALTER TABLE "RefreshToken" ADD CONSTRAINT "RefreshToken_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DuoMember" ADD CONSTRAINT "DuoMember_duoId_fkey" FOREIGN KEY ("duoId") REFERENCES "Duo"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DuoMember" ADD CONSTRAINT "DuoMember_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Habit" ADD CONSTRAINT "Habit_duoId_fkey" FOREIGN KEY ("duoId") REFERENCES "Duo"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CheckIn" ADD CONSTRAINT "CheckIn_habitId_fkey" FOREIGN KEY ("habitId") REFERENCES "Habit"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CheckIn" ADD CONSTRAINT "CheckIn_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Poke" ADD CONSTRAINT "Poke_fromUserId_fkey" FOREIGN KEY ("fromUserId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Poke" ADD CONSTRAINT "Poke_toUserId_fkey" FOREIGN KEY ("toUserId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Poke" ADD CONSTRAINT "Poke_habitId_fkey" FOREIGN KEY ("habitId") REFERENCES "Habit"("id") ON DELETE CASCADE ON UPDATE CASCADE;
