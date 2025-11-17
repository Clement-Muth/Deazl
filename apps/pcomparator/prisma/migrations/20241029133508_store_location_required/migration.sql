/*
  Warnings:

  - Made the column `location` on table `Store` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "Store" ALTER COLUMN "location" SET NOT NULL;
