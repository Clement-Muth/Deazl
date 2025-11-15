-- CreateTable
CREATE TABLE "RecipeTip" (
    "id" UUID NOT NULL,
    "recipeId" UUID NOT NULL,
    "title" TEXT,
    "content" TEXT NOT NULL,
    "category" TEXT NOT NULL DEFAULT 'general',
    "order" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "RecipeTip_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "RecipeTip_recipeId_idx" ON "RecipeTip"("recipeId");

-- AddForeignKey
ALTER TABLE "RecipeTip" ADD CONSTRAINT "RecipeTip_recipeId_fkey" FOREIGN KEY ("recipeId") REFERENCES "Recipe"("id") ON DELETE CASCADE ON UPDATE CASCADE;
