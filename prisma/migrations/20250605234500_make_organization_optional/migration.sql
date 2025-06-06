-- AlterTable
ALTER TABLE "bankTypeAccount" ALTER COLUMN "organizationId" DROP NOT NULL;

-- AlterTable
ALTER TABLE "bankTypeAccount" DROP CONSTRAINT IF EXISTS "bankTypeAccount_organizationId_fkey",
ADD CONSTRAINT "bankTypeAccount_organizationId_fkey" 
FOREIGN KEY ("organizationId") 
REFERENCES "organizations"("id") 
ON DELETE SET NULL 
ON UPDATE CASCADE; 