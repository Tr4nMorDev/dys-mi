/*
  Warnings:

  - You are about to drop the column `google` on the `User` table. All the data in the column will be lost.

*/
-- CreateEnum
CREATE TYPE "AuthProvider" AS ENUM ('EMAIL', 'GOOGLE', 'GITHUB');

-- AlterTable
ALTER TABLE "User" DROP COLUMN "google",
ADD COLUMN     "provider" "AuthProvider" NOT NULL DEFAULT 'EMAIL';
