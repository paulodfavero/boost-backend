/*
  Warnings:

  - You are about to drop the column `received_from` on the `expenses` table. All the data in the column will be lost.
  - You are about to drop the column `received_from` on the `gains` table. All the data in the column will be lost.
  - Added the required column `company` to the `expenses` table without a default value. This is not possible if the table is not empty.
  - Added the required column `company` to the `gains` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "expenses" DROP COLUMN "received_from",
ADD COLUMN     "company" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "gains" DROP COLUMN "received_from",
ADD COLUMN     "company" TEXT NOT NULL;
