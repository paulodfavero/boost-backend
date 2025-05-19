/*
  Warnings:

  - A unique constraint covering the columns `[bank_transaction_id]` on the table `gains` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "gains" ADD COLUMN     "bankId" TEXT,
ADD COLUMN     "bankTypeAccountId" TEXT,
ADD COLUMN     "bank_transaction_id" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "gains_bank_transaction_id_key" ON "gains"("bank_transaction_id");

-- AddForeignKey
ALTER TABLE "gains" ADD CONSTRAINT "gains_bankId_fkey" FOREIGN KEY ("bankId") REFERENCES "banks"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "gains" ADD CONSTRAINT "gains_bankTypeAccountId_fkey" FOREIGN KEY ("bankTypeAccountId") REFERENCES "bankTypeAccount"("id") ON DELETE SET NULL ON UPDATE CASCADE;
