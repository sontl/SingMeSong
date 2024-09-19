/*
  Warnings:

  - A unique constraint covering the columns `[sId]` on the table `Song` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "Song" ADD COLUMN     "sId" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "Song_sId_key" ON "Song"("sId");
