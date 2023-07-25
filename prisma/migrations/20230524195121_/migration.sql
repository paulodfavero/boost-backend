/*
  Warnings:

  - You are about to drop the column `hasMFA` on the `banks` table. All the data in the column will be lost.
  - You are about to drop the column `imageUrl` on the `banks` table. All the data in the column will be lost.
  - You are about to drop the column `institutionUrl` on the `banks` table. All the data in the column will be lost.
  - You are about to drop the column `itemId` on the `banks` table. All the data in the column will be lost.
  - You are about to drop the column `lastUpdatedAt` on the `banks` table. All the data in the column will be lost.
  - You are about to drop the column `primaryColor` on the `banks` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[item_id]` on the table `banks` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `has_MFA` to the `banks` table without a default value. This is not possible if the table is not empty.
  - Added the required column `image_url` to the `banks` table without a default value. This is not possible if the table is not empty.
  - Added the required column `institution_url` to the `banks` table without a default value. This is not possible if the table is not empty.
  - Added the required column `item_id` to the `banks` table without a default value. This is not possible if the table is not empty.
  - Added the required column `primary_color` to the `banks` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "banks_itemId_key";

-- AlterTable
ALTER TABLE "banks" DROP COLUMN "hasMFA",
DROP COLUMN "imageUrl",
DROP COLUMN "institutionUrl",
DROP COLUMN "itemId",
DROP COLUMN "lastUpdatedAt",
DROP COLUMN "primaryColor",
ADD COLUMN     "has_MFA" BOOLEAN NOT NULL,
ADD COLUMN     "image_url" TEXT NOT NULL,
ADD COLUMN     "institution_url" TEXT NOT NULL,
ADD COLUMN     "item_id" TEXT NOT NULL,
ADD COLUMN     "last_updated_at" TIMESTAMP(3),
ADD COLUMN     "primary_color" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "banks_item_id_key" ON "banks"("item_id");
