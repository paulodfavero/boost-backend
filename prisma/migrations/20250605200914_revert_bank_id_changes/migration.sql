/*
  Warnings:

  - You are about to drop the column `bankItemId` on the `bankTypeAccount` table. All the data in the column will be lost.
  - Added the required column `bankId` to the `bankTypeAccount` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "bankTypeAccount" DROP CONSTRAINT "bankTypeAccount_bankItemId_fkey";

-- AlterTable
ALTER TABLE "bankTypeAccount" DROP COLUMN "bankItemId",
ADD COLUMN     "bankId" TEXT NOT NULL;

-- AddForeignKey
ALTER TABLE "bankTypeAccount" ADD CONSTRAINT "bankTypeAccount_bankId_fkey" FOREIGN KEY ("bankId") REFERENCES "banks"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
