/*
  Warnings:

  - You are about to drop the column `status` on the `Game` table. All the data in the column will be lost.
  - You are about to drop the column `turn` on the `Game` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Game" DROP COLUMN "status",
DROP COLUMN "turn",
ADD COLUMN     "finishedAt" TIMESTAMP(3),
ADD COLUMN     "winnerId" INTEGER,
ALTER COLUMN "boardState" DROP DEFAULT;

-- DropEnum
DROP TYPE "GameStatus";
