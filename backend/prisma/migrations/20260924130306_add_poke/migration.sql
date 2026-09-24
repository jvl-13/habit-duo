-- CreateTable
CREATE TABLE "Poke" (
    "id" TEXT NOT NULL,
    "pairId" TEXT NOT NULL,
    "senderId" TEXT NOT NULL,
    "receiverId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Poke_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Poke_pairId_senderId_createdAt_idx" ON "Poke"("pairId", "senderId", "createdAt");

-- AddForeignKey
ALTER TABLE "Poke" ADD CONSTRAINT "Poke_pairId_fkey" FOREIGN KEY ("pairId") REFERENCES "HabitPair"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
