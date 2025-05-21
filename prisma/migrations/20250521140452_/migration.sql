/*
  Warnings:

  - A unique constraint covering the columns `[account_id]` on the table `bankTypeAccount` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "bankTypeAccount_account_id_key" ON "bankTypeAccount"("account_id");
