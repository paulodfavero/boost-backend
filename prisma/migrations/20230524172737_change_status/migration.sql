/*
  Warnings:

  - You are about to drop the column `statys` on the `banks` table. All the data in the column will be lost.
  - Added the required column `status` to the `banks` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "banks" DROP COLUMN "statys",
ADD COLUMN     "status" TEXT NOT NULL;
