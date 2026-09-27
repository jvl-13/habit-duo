/*
  Warnings:

  - Added the required column `role` to the `DuoMember` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "DuoMemberRole" AS ENUM ('INVITER', 'INVITEE');

-- AlterTable
ALTER TABLE "DuoMember" ADD COLUMN     "role" "DuoMemberRole" NOT NULL;

-- CreateIndex
CREATE INDEX "DuoMember_userId_idx" ON "DuoMember"("userId");
