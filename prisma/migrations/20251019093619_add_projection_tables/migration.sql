-- CreateTable
CREATE TABLE "expenses_projection" (
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

    CONSTRAINT "expenses_projection_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "gains_projection" (
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

    CONSTRAINT "gains_projection_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "credits_projection" (
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

    CONSTRAINT "credits_projection_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "expenses_projection_bank_transaction_id_key" ON "expenses_projection"("bank_transaction_id");

-- CreateIndex
CREATE UNIQUE INDEX "gains_projection_bank_transaction_id_key" ON "gains_projection"("bank_transaction_id");

-- CreateIndex
CREATE UNIQUE INDEX "credits_projection_bank_transaction_id_key" ON "credits_projection"("bank_transaction_id");

-- AddForeignKey
ALTER TABLE "expenses_projection" ADD CONSTRAINT "expenses_projection_bankId_fkey" FOREIGN KEY ("bankId") REFERENCES "banks"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "expenses_projection" ADD CONSTRAINT "expenses_projection_bankTypeAccountId_fkey" FOREIGN KEY ("bankTypeAccountId") REFERENCES "bankTypeAccount"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "expenses_projection" ADD CONSTRAINT "expenses_projection_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organizations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "gains_projection" ADD CONSTRAINT "gains_projection_bankId_fkey" FOREIGN KEY ("bankId") REFERENCES "banks"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "gains_projection" ADD CONSTRAINT "gains_projection_bankTypeAccountId_fkey" FOREIGN KEY ("bankTypeAccountId") REFERENCES "bankTypeAccount"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "gains_projection" ADD CONSTRAINT "gains_projection_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organizations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "credits_projection" ADD CONSTRAINT "credits_projection_bankId_fkey" FOREIGN KEY ("bankId") REFERENCES "banks"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "credits_projection" ADD CONSTRAINT "credits_projection_bankTypeAccountId_fkey" FOREIGN KEY ("bankTypeAccountId") REFERENCES "bankTypeAccount"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "credits_projection" ADD CONSTRAINT "credits_projection_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organizations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

