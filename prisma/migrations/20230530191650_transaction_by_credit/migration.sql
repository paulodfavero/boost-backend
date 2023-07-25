/*
  Warnings:

  - Added the required column `transactionId` to the `expenses` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "expenses" ADD COLUMN     "transactionId" TEXT NOT NULL,
ALTER COLUMN "category" DROP NOT NULL,
ALTER COLUMN "paid" SET DEFAULT false;

-- AlterTable
ALTER TABLE "gains" ALTER COLUMN "category" DROP NOT NULL,
ALTER COLUMN "paid" SET DEFAULT false;
