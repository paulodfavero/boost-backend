/*
  Warnings:

  - A unique constraint covering the columns `[bank_transaction_id]` on the table `expenses` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "expenses_bank_transaction_id_key" ON "expenses"("bank_transaction_id");
