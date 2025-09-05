/*
  Warnings:

  - A unique constraint covering the columns `[bankId]` on the table `investments` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "investments_bankId_key" ON "investments"("bankId");
