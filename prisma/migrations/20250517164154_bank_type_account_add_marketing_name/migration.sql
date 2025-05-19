/*
  Warnings:

  - Added the required column `marketing_name` to the `bankTypeAccount` table without a default value. This is not possible if the table is not empty.
  - Added the required column `tax_number` to the `bankTypeAccount` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "bankTypeAccount" ADD COLUMN     "marketing_name" TEXT NOT NULL,
ADD COLUMN     "tax_number" TEXT NOT NULL,
ALTER COLUMN "bankData" DROP NOT NULL;
