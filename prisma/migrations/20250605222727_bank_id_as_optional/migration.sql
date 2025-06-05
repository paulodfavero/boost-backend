-- DropForeignKey
ALTER TABLE "bankTypeAccount" DROP CONSTRAINT "bankTypeAccount_bankId_fkey";

-- AlterTable
ALTER TABLE "bankTypeAccount" ALTER COLUMN "bankId" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "bankTypeAccount" ADD CONSTRAINT "bankTypeAccount_bankId_fkey" FOREIGN KEY ("bankId") REFERENCES "banks"("id") ON DELETE SET NULL ON UPDATE CASCADE;
