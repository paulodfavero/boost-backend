/*
  Warnings:

  - Made the column `organizationId` on table `bankTypeAccount` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE "bankTypeAccount" DROP CONSTRAINT "bankTypeAccount_organizationId_fkey";

-- AlterTable
ALTER TABLE "bankTypeAccount" ALTER COLUMN "organizationId" SET NOT NULL;

-- AddForeignKey
ALTER TABLE "bankTypeAccount" ADD CONSTRAINT "bankTypeAccount_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organizations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
