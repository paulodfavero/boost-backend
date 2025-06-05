-- DropForeignKey
ALTER TABLE "bankTypeAccount" DROP CONSTRAINT "bankTypeAccount_bankId_fkey";

-- AlterTable
ALTER TABLE "bankTypeAccount" ADD COLUMN     "bankItemId" TEXT;

-- AddForeignKey
ALTER TABLE "bankTypeAccount" ADD CONSTRAINT "bankTypeAccount_bankItemId_fkey" FOREIGN KEY ("bankItemId") REFERENCES "banks"("item_id") ON DELETE SET NULL ON UPDATE CASCADE;
