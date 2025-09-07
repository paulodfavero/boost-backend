-- AlterTable
ALTER TABLE "organizations" ADD COLUMN     "plan" TEXT NOT NULL DEFAULT 'free',
ADD COLUMN     "trial_end" TIMESTAMP(3),
ADD COLUMN     "trial_start" TIMESTAMP(3);
