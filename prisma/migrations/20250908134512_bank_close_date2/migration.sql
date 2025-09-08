/*
  Warnings:

  - You are about to drop the column `balanceCloseDateWeekDay` on the `bankTypeAccount` table. All the data in the column will be lost.
  - You are about to drop the column `balanceDueDateWeekDay` on the `bankTypeAccount` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "bankTypeAccount" DROP COLUMN "balanceCloseDateWeekDay",
DROP COLUMN "balanceDueDateWeekDay",
ADD COLUMN     "balance_close_date_week_day" TEXT,
ADD COLUMN     "balance_due_date_week_day" TEXT;
