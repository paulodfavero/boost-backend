/*
  Warnings:

  - You are about to drop the column `bankId` on the `bankTypeAccount` table. All the data in the column will be lost.
  - Added the required column `bankItemId` to the `bankTypeAccount` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "bankTypeAccount" DROP CONSTRAINT "bankTypeAccount_bankId_fkey";

-- AlterTable
ALTER TABLE "bankTypeAccount" DROP COLUMN "bankId",
ADD COLUMN     "bankItemId" TEXT NOT NULL;

-- AddForeignKey
ALTER TABLE "bankTypeAccount" ADD CONSTRAINT "bankTypeAccount_bankItemId_fkey" FOREIGN KEY ("bankItemId") REFERENCES "banks"("item_id") ON DELETE RESTRICT ON UPDATE CASCADE;
