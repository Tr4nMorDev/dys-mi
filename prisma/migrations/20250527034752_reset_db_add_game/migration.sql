/*
  Warnings:

  - The values [ongoing,finished] on the enum `MatchStatus` will be removed. If these variants are still used in the database, this will fail.
  - You are about to drop the column `createdAt` on the `Match` table. All the data in the column will be lost.
  - You are about to drop the column `playerOId` on the `Match` table. All the data in the column will be lost.
  - You are about to drop the column `playerXId` on the `Match` table. All the data in the column will be lost.
  - Added the required column `player1Id` to the `Match` table without a default value. This is not possible if the table is not empty.
  - Added the required column `player2Id` to the `Match` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "GameStatus" AS ENUM ('ongoing', 'finished', 'draw');

-- AlterEnum
BEGIN;
CREATE TYPE "MatchStatus_new" AS ENUM ('waiting', 'matched');
ALTER TABLE "Match" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "Match" ALTER COLUMN "status" TYPE "MatchStatus_new" USING ("status"::text::"MatchStatus_new");
ALTER TYPE "MatchStatus" RENAME TO "MatchStatus_old";
ALTER TYPE "MatchStatus_new" RENAME TO "MatchStatus";
DROP TYPE "MatchStatus_old";
ALTER TABLE "Match" ALTER COLUMN "status" SET DEFAULT 'waiting';
COMMIT;

-- DropForeignKey
ALTER TABLE "Match" DROP CONSTRAINT "Match_playerOId_fkey";

-- DropForeignKey
ALTER TABLE "Match" DROP CONSTRAINT "Match_playerXId_fkey";

-- AlterTable
ALTER TABLE "Match" DROP COLUMN "createdAt",
DROP COLUMN "playerOId",
DROP COLUMN "playerXId",
ADD COLUMN     "matchedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "player1Id" INTEGER NOT NULL,
ADD COLUMN     "player2Id" INTEGER NOT NULL,
ALTER COLUMN "status" SET DEFAULT 'waiting';

-- CreateTable
CREATE TABLE "Game" (
    "id" SERIAL NOT NULL,
    "matchId" INTEGER NOT NULL,
    "xPlayerId" INTEGER NOT NULL,
    "oPlayerId" INTEGER NOT NULL,
    "boardState" JSONB NOT NULL DEFAULT '{}',
    "turn" TEXT NOT NULL DEFAULT 'X',
    "status" "GameStatus" NOT NULL DEFAULT 'ongoing',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Game_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Game_matchId_key" ON "Game"("matchId");

-- AddForeignKey
ALTER TABLE "Match" ADD CONSTRAINT "Match_player1Id_fkey" FOREIGN KEY ("player1Id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Match" ADD CONSTRAINT "Match_player2Id_fkey" FOREIGN KEY ("player2Id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Game" ADD CONSTRAINT "Game_matchId_fkey" FOREIGN KEY ("matchId") REFERENCES "Match"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Game" ADD CONSTRAINT "Game_xPlayerId_fkey" FOREIGN KEY ("xPlayerId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Game" ADD CONSTRAINT "Game_oPlayerId_fkey" FOREIGN KEY ("oPlayerId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
