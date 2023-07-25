/*
  Warnings:

  - You are about to drop the column `transactionId` on the `expenses` table. All the data in the column will be lost.
  - Added the required column `bank_transaction_id` to the `expenses` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "expenses" DROP COLUMN "transactionId",
ADD COLUMN     "bank_transaction_id" TEXT NOT NULL;
