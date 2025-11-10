/*
  Warnings:

  - You are about to drop the column `customName` on the `RecipeIngredient` table. All the data in the column will be lost.
  - Made the column `productId` on table `RecipeIngredient` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE "RecipeIngredient" DROP CONSTRAINT "RecipeIngredient_productId_fkey";

-- AlterTable
ALTER TABLE "RecipeIngredient" DROP COLUMN "customName",
ALTER COLUMN "productId" SET NOT NULL;

-- AddForeignKey
ALTER TABLE "RecipeIngredient" ADD CONSTRAINT "RecipeIngredient_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
