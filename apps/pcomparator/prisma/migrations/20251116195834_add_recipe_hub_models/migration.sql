-- CreateTable
CREATE TABLE "RecipeCategory" (
    "id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT,
    "icon" TEXT,
    "parentId" UUID,
    "order" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "RecipeCategory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RecipeTag" (
    "id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "color" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "RecipeTag_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RecipeTrending" (
    "id" UUID NOT NULL,
    "recipeId" UUID NOT NULL,
    "score" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "viewsLast7Days" INTEGER NOT NULL DEFAULT 0,
    "favoritesLast7Days" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "RecipeTrending_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "RecipeCategory_slug_key" ON "RecipeCategory"("slug");

-- CreateIndex
CREATE INDEX "RecipeCategory_slug_idx" ON "RecipeCategory"("slug");

-- CreateIndex
CREATE INDEX "RecipeCategory_parentId_idx" ON "RecipeCategory"("parentId");

-- CreateIndex
CREATE UNIQUE INDEX "RecipeTag_name_key" ON "RecipeTag"("name");

-- CreateIndex
CREATE UNIQUE INDEX "RecipeTag_slug_key" ON "RecipeTag"("slug");

-- CreateIndex
CREATE INDEX "RecipeTag_slug_idx" ON "RecipeTag"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "RecipeTrending_recipeId_key" ON "RecipeTrending"("recipeId");

-- CreateIndex
CREATE INDEX "RecipeTrending_score_idx" ON "RecipeTrending"("score");

-- CreateIndex
CREATE INDEX "RecipeTrending_updatedAt_idx" ON "RecipeTrending"("updatedAt");

-- CreateIndex
CREATE INDEX "Recipe_isPublic_idx" ON "Recipe"("isPublic");

-- CreateIndex
CREATE INDEX "Recipe_category_idx" ON "Recipe"("category");

-- CreateIndex
CREATE INDEX "Recipe_cuisine_idx" ON "Recipe"("cuisine");

-- CreateIndex
CREATE INDEX "Recipe_difficulty_idx" ON "Recipe"("difficulty");

-- CreateIndex
CREATE INDEX "Recipe_createdAt_idx" ON "Recipe"("createdAt");

-- CreateIndex
CREATE INDEX "Recipe_viewsCount_idx" ON "Recipe"("viewsCount");

-- CreateIndex
CREATE INDEX "Recipe_favoritesCount_idx" ON "Recipe"("favoritesCount");

-- AddForeignKey
ALTER TABLE "RecipeCategory" ADD CONSTRAINT "RecipeCategory_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "RecipeCategory"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RecipeTrending" ADD CONSTRAINT "RecipeTrending_recipeId_fkey" FOREIGN KEY ("recipeId") REFERENCES "Recipe"("id") ON DELETE CASCADE ON UPDATE CASCADE;
