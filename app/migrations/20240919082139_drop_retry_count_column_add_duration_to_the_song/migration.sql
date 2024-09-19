/*
  Warnings:

  - You are about to drop the column `retryCount` on the `Song` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Song" DROP COLUMN "retryCount",
ADD COLUMN     "duration" INTEGER NOT NULL DEFAULT 0;
