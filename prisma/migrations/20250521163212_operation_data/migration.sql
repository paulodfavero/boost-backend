-- AlterTable
ALTER TABLE "expenses" ADD COLUMN     "operation_type" TEXT,
ADD COLUMN     "payment_data" TEXT;

-- AlterTable
ALTER TABLE "gains" ADD COLUMN     "operation_type" TEXT,
ADD COLUMN     "payment_data" TEXT;
