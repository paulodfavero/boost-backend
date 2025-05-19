/*
  Warnings:

  - You are about to drop the column `bankData` on the `bankTypeAccount` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "bankTypeAccount" DROP COLUMN "bankData",
ADD COLUMN     "bank_data" TEXT;
