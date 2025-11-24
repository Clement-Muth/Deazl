-- AlterTable
ALTER TABLE "RecipeIngredient" ADD COLUMN     "groupId" UUID;

-- AlterTable
ALTER TABLE "RecipeStep" ADD COLUMN     "groupId" UUID;

-- CreateTable
CREATE TABLE "IngredientGroup" (
    "id" UUID NOT NULL,
    "recipeId" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "IngredientGroup_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StepGroup" (
    "id" UUID NOT NULL,
    "recipeId" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "StepGroup_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "IngredientGroup_recipeId_idx" ON "IngredientGroup"("recipeId");

-- CreateIndex
CREATE INDEX "StepGroup_recipeId_idx" ON "StepGroup"("recipeId");

-- CreateIndex
CREATE INDEX "RecipeIngredient_groupId_idx" ON "RecipeIngredient"("groupId");

-- CreateIndex
CREATE INDEX "RecipeStep_groupId_idx" ON "RecipeStep"("groupId");

-- AddForeignKey
ALTER TABLE "IngredientGroup" ADD CONSTRAINT "IngredientGroup_recipeId_fkey" FOREIGN KEY ("recipeId") REFERENCES "Recipe"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RecipeIngredient" ADD CONSTRAINT "RecipeIngredient_groupId_fkey" FOREIGN KEY ("groupId") REFERENCES "IngredientGroup"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StepGroup" ADD CONSTRAINT "StepGroup_recipeId_fkey" FOREIGN KEY ("recipeId") REFERENCES "Recipe"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RecipeStep" ADD CONSTRAINT "RecipeStep_groupId_fkey" FOREIGN KEY ("groupId") REFERENCES "StepGroup"("id") ON DELETE SET NULL ON UPDATE CASCADE;
