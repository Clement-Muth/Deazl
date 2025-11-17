/*
  Warnings:

  - Changed the type of `currency` on the `Price` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- CreateEnum
CREATE TYPE "Currency" AS ENUM ('AED', 'AUD', 'CAD', 'CHF', 'CNY', 'EUR', 'GBP', 'JPY', 'USD');

-- AlterTable
ALTER TABLE "Price" DROP COLUMN "currency",
ADD COLUMN     "currency" "Currency" NOT NULL;
