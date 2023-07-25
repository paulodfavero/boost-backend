/*
  Warnings:

  - You are about to drop the column `cpg` on the `accounts` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[cpf]` on the table `accounts` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "accounts_cpg_key";

-- AlterTable
ALTER TABLE "accounts" DROP COLUMN "cpg",
ADD COLUMN     "cpf" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "accounts_cpf_key" ON "accounts"("cpf");
