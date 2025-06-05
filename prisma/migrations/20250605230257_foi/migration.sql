-- DropForeignKey
ALTER TABLE "bankTypeAccount" DROP CONSTRAINT "bankTypeAccount_bankItemId_fkey";

-- DropForeignKey
ALTER TABLE "bankTypeAccount" DROP CONSTRAINT "bankTypeAccount_organizationId_fkey";

-- AlterTable
ALTER TABLE "bankTypeAccount" ALTER COLUMN "organizationId" DROP NOT NULL,
ALTER COLUMN "bankItemId" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "bankTypeAccount" ADD CONSTRAINT "bankTypeAccount_bankItemId_fkey" FOREIGN KEY ("bankItemId") REFERENCES "banks"("item_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bankTypeAccount" ADD CONSTRAINT "bankTypeAccount_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organizations"("id") ON DELETE SET NULL ON UPDATE CASCADE;
