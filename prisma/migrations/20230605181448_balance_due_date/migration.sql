-- AlterTable
ALTER TABLE "expenses" ADD COLUMN     "balance_due_date" TIMESTAMP(3),
ALTER COLUMN "balance_close_date" DROP NOT NULL;
