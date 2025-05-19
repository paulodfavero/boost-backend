-- AlterTable
ALTER TABLE "expenses" ADD COLUMN     "bankTypeAccountId" TEXT;

-- CreateTable
CREATE TABLE "bankTypeAccount" (
    "id" TEXT NOT NULL DEFAULT nanoid(11),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "type" TEXT NOT NULL,
    "subtype" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "owner" TEXT NOT NULL,
    "balance" INTEGER NOT NULL,
    "currency_code" TEXT NOT NULL,
    "item_id" TEXT NOT NULL,
    "number" TEXT NOT NULL,
    "last_updated_at" TIMESTAMP(3),
    "bankData" TEXT NOT NULL,
    "bankId" TEXT NOT NULL,
    "organizationId" TEXT,

    CONSTRAINT "bankTypeAccount_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "expenses" ADD CONSTRAINT "expenses_bankTypeAccountId_fkey" FOREIGN KEY ("bankTypeAccountId") REFERENCES "bankTypeAccount"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bankTypeAccount" ADD CONSTRAINT "bankTypeAccount_bankId_fkey" FOREIGN KEY ("bankId") REFERENCES "banks"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bankTypeAccount" ADD CONSTRAINT "bankTypeAccount_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organizations"("id") ON DELETE SET NULL ON UPDATE CASCADE;
