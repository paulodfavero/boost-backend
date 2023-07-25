/*
  Warnings:

  - Added the required column `accountId` to the `users` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "users" ADD COLUMN     "accountId" TEXT NOT NULL;

-- CreateTable
CREATE TABLE "accounts" (
    "id" TEXT NOT NULL DEFAULT nanoid(11),
    "name" TEXT NOT NULL,
    "cnpj" TEXT,
    "cpg" TEXT,

    CONSTRAINT "accounts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "expenses" (
    "id" TEXT NOT NULL DEFAULT nanoid(11),
    "expiration_date" TIMESTAMP(3) NOT NULL,
    "description" TEXT NOT NULL,
    "received_from" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "amount" INTEGER NOT NULL,
    "type_payment" TEXT NOT NULL,
    "installment_current" INTEGER,
    "installment_total_payment" INTEGER,
    "paid" BOOLEAN NOT NULL,
    "accountId" TEXT NOT NULL,

    CONSTRAINT "expenses_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "gains" (
    "id" TEXT NOT NULL DEFAULT nanoid(11),
    "expiration_date" TIMESTAMP(3) NOT NULL,
    "description" TEXT NOT NULL,
    "received_from" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "amount" INTEGER NOT NULL,
    "type_payment" TEXT NOT NULL,
    "installment_current" INTEGER,
    "installment_total_payment" INTEGER,
    "paid" BOOLEAN NOT NULL,
    "accountId" TEXT NOT NULL,

    CONSTRAINT "gains_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "accounts_cnpj_key" ON "accounts"("cnpj");

-- CreateIndex
CREATE UNIQUE INDEX "accounts_cpg_key" ON "accounts"("cpg");

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "accounts"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "expenses" ADD CONSTRAINT "expenses_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "accounts"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "gains" ADD CONSTRAINT "gains_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "accounts"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
