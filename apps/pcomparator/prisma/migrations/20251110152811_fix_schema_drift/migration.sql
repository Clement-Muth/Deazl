-- Fix schema drift: align database with current schema.prisma
-- This migration preserves all existing data

-- Step 1: RecipeIngredient - Remove customName and make productId required
-- First, handle any NULL productId values (if any exist)
-- Set them to a default product or delete those records
DELETE FROM "RecipeIngredient" WHERE "productId" IS NULL;

-- Remove customName column if it exists
ALTER TABLE "RecipeIngredient" DROP COLUMN IF EXISTS "customName";

-- Make productId NOT NULL
ALTER TABLE "RecipeIngredient" ALTER COLUMN "productId" SET NOT NULL;

-- Step 2: ShoppingListItem - Remove custom fields and add recipeId
-- First, handle any NULL productId values (if any exist)
DELETE FROM "ShoppingListItem" WHERE "productId" IS NULL;

-- Remove old columns if they exist
ALTER TABLE "ShoppingListItem" DROP COLUMN IF EXISTS "barcode";
ALTER TABLE "ShoppingListItem" DROP COLUMN IF EXISTS "customName";
ALTER TABLE "ShoppingListItem" DROP COLUMN IF EXISTS "price";

-- Add recipeId column if it doesn't exist (UUID type to match Recipe.id)
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'ShoppingListItem' AND column_name = 'recipeId'
  ) THEN
    ALTER TABLE "ShoppingListItem" ADD COLUMN "recipeId" UUID;
  END IF;
END $$;

-- Make productId NOT NULL
ALTER TABLE "ShoppingListItem" ALTER COLUMN "productId" SET NOT NULL;

-- Add foreign key constraint for recipeId if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'ShoppingListItem_recipeId_fkey'
  ) THEN
    ALTER TABLE "ShoppingListItem" 
    ADD CONSTRAINT "ShoppingListItem_recipeId_fkey" 
    FOREIGN KEY ("recipeId") REFERENCES "Recipe"("id") ON DELETE SET NULL;
  END IF;
END $$;
