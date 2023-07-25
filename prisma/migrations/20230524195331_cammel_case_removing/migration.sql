/*
  Warnings:

  - You are about to drop the column `has_MFA` on the `banks` table. All the data in the column will be lost.
  - Added the required column `has_mfa` to the `banks` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "banks" DROP COLUMN "has_MFA",
ADD COLUMN     "has_mfa" BOOLEAN NOT NULL;
