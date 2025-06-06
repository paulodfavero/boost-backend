-- Drop existing function if exists
DROP FUNCTION IF EXISTS nanoid(integer) CASCADE;

-- Create nanoid function
CREATE OR REPLACE FUNCTION nanoid(size integer DEFAULT 21)
RETURNS text AS $$
DECLARE
  id text := '';
  i integer := 0;
  alphabet text := '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
  alphabet_length integer := length(alphabet);
BEGIN
  WHILE i < size LOOP
    id := id || substr(alphabet, floor(random() * alphabet_length + 1)::integer, 1);
    i := i + 1;
  END LOOP;
  RETURN id;
END;
$$ LANGUAGE plpgsql;

-- CreateTable
CREATE TABLE "organizations" (
    "id" TEXT NOT NULL DEFAULT nanoid(11),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "name" TEXT NOT NULL,
    "password" TEXT,
    "cnpj" TEXT,
    "cpf" TEXT,
    "email" TEXT,
    "stripe_customer_id" TEXT,

    CONSTRAINT "organizations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "expenses" (
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

    CONSTRAINT "expenses_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "gains" (
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

    CONSTRAINT "gains_pkey" PRIMARY KEY ("id")
);

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

-- CreateTable
CREATE TABLE "categories" (
    "id" TEXT NOT NULL DEFAULT nanoid(11),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "name" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,

    CONSTRAINT "categories_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "companies" (
    "id" TEXT NOT NULL DEFAULT nanoid(11),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "name" TEXT NOT NULL,
    "cnpj" TEXT,
    "category" TEXT,
    "business_name" TEXT,
    "organizationId" TEXT NOT NULL,

    CONSTRAINT "companies_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "banks" (
    "id" TEXT NOT NULL DEFAULT nanoid(11),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "item_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "primary_color" TEXT NOT NULL,
    "institution_url" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "image_url" TEXT NOT NULL,
    "has_mfa" BOOLEAN NOT NULL,
    "products" TEXT[],
    "status" TEXT NOT NULL,
    "last_updated_at" TIMESTAMP(3),
    "organizationId" TEXT NOT NULL,

    CONSTRAINT "banks_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "bankTypeAccount" (
    "id" TEXT NOT NULL DEFAULT nanoid(11),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "type" TEXT NOT NULL,
    "subtype" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "marketing_name" TEXT,
    "owner" TEXT NOT NULL,
    "balance" DOUBLE PRECISION NOT NULL,
    "currency_code" TEXT NOT NULL,
    "tax_number" TEXT,
    "account_id" TEXT NOT NULL,
    "item_id" TEXT NOT NULL,
    "number" TEXT NOT NULL,
    "last_updated_at" TIMESTAMP(3),
    "bank_data" TEXT,
    "credit_data" TEXT,
    "bankId" TEXT,
    "bankItemId" TEXT,
    "organizationId" TEXT,

    CONSTRAINT "bankTypeAccount_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "name" TEXT,
    "email" TEXT,
    "emailVerified" TIMESTAMP(3),
    "image" TEXT,
    "organizationId" TEXT NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Account" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "providerAccountId" TEXT NOT NULL,
    "refresh_token" TEXT,
    "access_token" TEXT,
    "expires_at" INTEGER,
    "token_type" TEXT,
    "scope" TEXT,
    "id_token" TEXT,
    "session_state" TEXT,

    CONSTRAINT "Account_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Session" (
    "id" TEXT NOT NULL,
    "sessionToken" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Session_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VerificationToken" (
    "identifier" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL
);

-- CreateTable
CREATE TABLE "suggestions" (
    "id" TEXT NOT NULL DEFAULT nanoid(11),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "amount_by_month" INTEGER NOT NULL,
    "is_useful" BOOLEAN NOT NULL,
    "message" TEXT,
    "organizationId" TEXT NOT NULL,

    CONSTRAINT "suggestions_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "organizations_cnpj_key" ON "organizations"("cnpj");

-- CreateIndex
CREATE UNIQUE INDEX "organizations_cpf_key" ON "organizations"("cpf");

-- CreateIndex
CREATE UNIQUE INDEX "organizations_email_key" ON "organizations"("email");

-- CreateIndex
CREATE UNIQUE INDEX "expenses_bank_transaction_id_key" ON "expenses"("bank_transaction_id");

-- CreateIndex
CREATE UNIQUE INDEX "gains_bank_transaction_id_key" ON "gains"("bank_transaction_id");

-- CreateIndex
CREATE UNIQUE INDEX "credits_bank_transaction_id_key" ON "credits"("bank_transaction_id");

-- CreateIndex
CREATE UNIQUE INDEX "banks_item_id_key" ON "banks"("item_id");

-- CreateIndex
CREATE UNIQUE INDEX "bankTypeAccount_account_id_key" ON "bankTypeAccount"("account_id");

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Account_provider_providerAccountId_key" ON "Account"("provider", "providerAccountId");

-- CreateIndex
CREATE UNIQUE INDEX "Session_sessionToken_key" ON "Session"("sessionToken");

-- CreateIndex
CREATE UNIQUE INDEX "VerificationToken_token_key" ON "VerificationToken"("token");

-- CreateIndex
CREATE UNIQUE INDEX "VerificationToken_identifier_token_key" ON "VerificationToken"("identifier", "token");

-- AddForeignKey
ALTER TABLE "expenses" ADD CONSTRAINT "expenses_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organizations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "expenses" ADD CONSTRAINT "expenses_bankId_fkey" FOREIGN KEY ("bankId") REFERENCES "banks"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "expenses" ADD CONSTRAINT "expenses_bankTypeAccountId_fkey" FOREIGN KEY ("bankTypeAccountId") REFERENCES "bankTypeAccount"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "gains" ADD CONSTRAINT "gains_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organizations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "gains" ADD CONSTRAINT "gains_bankId_fkey" FOREIGN KEY ("bankId") REFERENCES "banks"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "gains" ADD CONSTRAINT "gains_bankTypeAccountId_fkey" FOREIGN KEY ("bankTypeAccountId") REFERENCES "bankTypeAccount"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "credits" ADD CONSTRAINT "credits_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organizations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "credits" ADD CONSTRAINT "credits_bankId_fkey" FOREIGN KEY ("bankId") REFERENCES "banks"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "credits" ADD CONSTRAINT "credits_bankTypeAccountId_fkey" FOREIGN KEY ("bankTypeAccountId") REFERENCES "bankTypeAccount"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "categories" ADD CONSTRAINT "categories_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organizations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "companies" ADD CONSTRAINT "companies_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organizations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "banks" ADD CONSTRAINT "banks_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organizations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bankTypeAccount" ADD CONSTRAINT "bankTypeAccount_bankItemId_fkey" FOREIGN KEY ("bankItemId") REFERENCES "banks"("item_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bankTypeAccount" ADD CONSTRAINT "bankTypeAccount_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organizations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organizations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Account" ADD CONSTRAINT "Account_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Session" ADD CONSTRAINT "Session_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "suggestions" ADD CONSTRAINT "suggestions_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organizations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
