/*
  Warnings:

  - You are about to drop the column `expiresAt` on the `account` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[token]` on the table `session` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "account" DROP COLUMN "expiresAt",
ADD COLUMN     "accessTokenExpiresAt" TIMESTAMP(3),
ADD COLUMN     "refreshTokenExpiresAt" TIMESTAMP(3),
ADD COLUMN     "scope" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "session_token_key" ON "session"("token");
