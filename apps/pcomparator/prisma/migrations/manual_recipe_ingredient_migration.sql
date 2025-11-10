-- Manual migration script to migrate from customName to productId
-- Run this BEFORE applying the Prisma schema changes

-- Step 1: Create generic products for all existing ingredients without productId
INSERT INTO "Product" (id, barcode, name, created_at, updated_at)
SELECT 
  gen_random_uuid(),
  'CUSTOM-' || gen_random_uuid()::text,
  COALESCE("customName", 'Unknown Product'),
  NOW(),
  NOW()
FROM "RecipeIngredient"
WHERE "productId" IS NULL AND "customName" IS NOT NULL
ON CONFLICT DO NOTHING;

-- Step 2: Link ingredients to their newly created products
WITH product_mapping AS (
  SELECT 
    ri.id as ingredient_id,
    p.id as product_id
  FROM "RecipeIngredient" ri
  JOIN "Product" p ON p.name = ri."customName" AND p.barcode LIKE 'CUSTOM-%'
  WHERE ri."productId" IS NULL AND ri."customName" IS NOT NULL
)
UPDATE "RecipeIngredient" ri
SET "productId" = pm.product_id
FROM product_mapping pm
WHERE ri.id = pm.ingredient_id;

-- Step 3: For any remaining NULL productIds, create and link to a default product
DO $$
DECLARE
  default_product_id uuid;
BEGIN
  -- Create or get default product
  INSERT INTO "Product" (id, barcode, name, created_at, updated_at)
  VALUES (
    gen_random_uuid(),
    'CUSTOM-DEFAULT',
    'Generic Product',
    NOW(),
    NOW()
  )
  ON CONFLICT (barcode) DO UPDATE SET name = 'Generic Product'
  RETURNING id INTO default_product_id;

  -- Link remaining ingredients to default product
  UPDATE "RecipeIngredient"
  SET "productId" = default_product_id
  WHERE "productId" IS NULL;
END $$;

-- Step 4: Verify all ingredients have productId
SELECT COUNT(*) as "Ingredients without productId (should be 0)" 
FROM "RecipeIngredient" 
WHERE "productId" IS NULL;

-- Step 5: Make productId NOT NULL and drop customName
ALTER TABLE "RecipeIngredient" ALTER COLUMN "productId" SET NOT NULL;
ALTER TABLE "RecipeIngredient" DROP COLUMN IF EXISTS "customName";
