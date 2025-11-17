/*
  Warnings:

  - A unique constraint covering the columns `[shareToken]` on the table `Recipe` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateEnum
CREATE TYPE "RecipeRole" AS ENUM ('OWNER', 'EDITOR', 'VIEWER');

-- AlterTable
ALTER TABLE "Recipe" ADD COLUMN     "shareToken" TEXT;

-- CreateTable
CREATE TABLE "RecipeCollaborator" (
    "id" UUID NOT NULL,
    "recipeId" UUID NOT NULL,
    "userId" TEXT NOT NULL,
    "role" "RecipeRole" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "RecipeCollaborator_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "RecipeCollaborator_recipeId_userId_key" ON "RecipeCollaborator"("recipeId", "userId");

-- CreateIndex
CREATE UNIQUE INDEX "Recipe_shareToken_key" ON "Recipe"("shareToken");

-- AddForeignKey
ALTER TABLE "RecipeCollaborator" ADD CONSTRAINT "RecipeCollaborator_recipeId_fkey" FOREIGN KEY ("recipeId") REFERENCES "Recipe"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RecipeCollaborator" ADD CONSTRAINT "RecipeCollaborator_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
