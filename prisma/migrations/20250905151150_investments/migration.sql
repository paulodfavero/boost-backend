-- AlterTable
ALTER TABLE "bankTypeAccount" ADD COLUMN     "is_bank_visible" BOOLEAN DEFAULT true;

-- AlterTable
ALTER TABLE "organizations" ADD COLUMN     "welcome_email_sent" BOOLEAN NOT NULL DEFAULT false;

-- CreateTable
CREATE TABLE "investments" (
    "id" TEXT NOT NULL DEFAULT nanoid(11),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
    "investments" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "bankId" TEXT,

    CONSTRAINT "investments_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "investments" ADD CONSTRAINT "investments_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organizations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "investments" ADD CONSTRAINT "investments_bankId_fkey" FOREIGN KEY ("bankId") REFERENCES "banks"("id") ON DELETE SET NULL ON UPDATE CASCADE;
