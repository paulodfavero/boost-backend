/*
  Warnings:

  - Added the required column `account_id` to the `bankTypeAccount` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "bankTypeAccount" ADD COLUMN     "account_id" TEXT NOT NULL;
