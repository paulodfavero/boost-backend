/*
  Warnings:

  - You are about to drop the column `group_installment` on the `expenses` table. All the data in the column will be lost.
  - You are about to drop the column `group_installment` on the `gains` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "expenses" DROP COLUMN "group_installment",
ADD COLUMN     "group_installment_id" TEXT;

-- AlterTable
ALTER TABLE "gains" DROP COLUMN "group_installment",
ADD COLUMN     "group_installment_id" TEXT;
