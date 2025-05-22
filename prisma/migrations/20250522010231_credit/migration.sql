-- CreateTable
CREATE TABLE "credits" (
    "id" TEXT NOT NULL DEFAULT nanoid(11),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiration_date" TIMESTAMP(3) NOT NULL,
    "purchase_date" TIMESTAMP(3),
    "balance_close_date" TIMESTAMP(3),
    "bank_transaction_id" TEXT,
    "description" TEXT NOT NULL,
    "company" TEXT NOT NULL,
    "category" TEXT,
    "amount" INTEGER NOT NULL,
    "type_payment" TEXT NOT NULL,
    "operation_type" TEXT,
    "payment_data" TEXT,
    "installment_current" INTEGER,
    "installment_total_payment" INTEGER,
    "paid" BOOLEAN NOT NULL DEFAULT false,
    "group_installment_id" TEXT,
    "organizationId" TEXT NOT NULL,
    "bankId" TEXT,
    "bankTypeAccountId" TEXT,

    CONSTRAINT "credits_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "credits_bank_transaction_id_key" ON "credits"("bank_transaction_id");

-- AddForeignKey
ALTER TABLE "credits" ADD CONSTRAINT "credits_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organizations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "credits" ADD CONSTRAINT "credits_bankId_fkey" FOREIGN KEY ("bankId") REFERENCES "banks"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "credits" ADD CONSTRAINT "credits_bankTypeAccountId_fkey" FOREIGN KEY ("bankTypeAccountId") REFERENCES "bankTypeAccount"("id") ON DELETE SET NULL ON UPDATE CASCADE;
