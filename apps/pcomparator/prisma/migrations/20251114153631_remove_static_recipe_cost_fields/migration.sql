/*
  Warnings:

  - You are about to drop the column `estimatedCostPerServing` on the `Recipe` table. All the data in the column will be lost.
  - You are about to drop the column `estimatedCostTotal` on the `Recipe` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Recipe" DROP COLUMN "estimatedCostPerServing",
DROP COLUMN "estimatedCostTotal";
