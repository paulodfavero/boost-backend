/*
  Warnings:

  - Added the required column `balance_close_date` to the `expenses` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "expenses" ADD COLUMN     "balance_close_date" TIMESTAMP(3) NOT NULL;
