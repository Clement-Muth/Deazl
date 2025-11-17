-- Fix foreign key constraints to match schema.prisma expectations

-- RecipeIngredient: Drop and recreate foreign key with correct ON DELETE behavior
ALTER TABLE "RecipeIngredient" DROP CONSTRAINT IF EXISTS "RecipeIngredient_productId_fkey";
ALTER TABLE "RecipeIngredient" 
  ADD CONSTRAINT "RecipeIngredient_productId_fkey" 
  FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- ShoppingListItem: Drop and recreate foreign keys with correct ON DELETE behaviors
ALTER TABLE "ShoppingListItem" DROP CONSTRAINT IF EXISTS "ShoppingListItem_productId_fkey";
ALTER TABLE "ShoppingListItem" DROP CONSTRAINT IF EXISTS "ShoppingListItem_recipeId_fkey";

ALTER TABLE "ShoppingListItem" 
  ADD CONSTRAINT "ShoppingListItem_productId_fkey" 
  FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "ShoppingListItem" 
  ADD CONSTRAINT "ShoppingListItem_recipeId_fkey" 
  FOREIGN KEY ("recipeId") REFERENCES "Recipe"("id") ON DELETE SET NULL ON UPDATE CASCADE;
