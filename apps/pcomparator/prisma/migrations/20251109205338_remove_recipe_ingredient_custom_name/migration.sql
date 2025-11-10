-- Step 1: Create generic products for all existing ingredients without productId
INSERT INTO "Product" (id, barcode, name, created_at, updated_at)
SELECT 
  gen_random_uuid(),
  'CUSTOM-' || gen_random_uuid()::text,
  COALESCE("customName", 'Unknown Product'),
  NOW(),
  NOW()
FROM "RecipeIngredient"
WHERE "productId" IS NULL
ON CONFLICT DO NOTHING;

-- Step 2: Link ingredients to their newly created products
UPDATE "RecipeIngredient" ri
SET "productId" = p.id
FROM "Product" p
WHERE ri."productId" IS NULL
  AND ri."customName" IS NOT NULL
  AND p.name = ri."customName"
  AND p.barcode LIKE 'CUSTOM-%';

-- Step 3: For any remaining NULL productIds, link to a default product
DO $$
DECLARE
  default_product_id uuid;
BEGIN
  -- Create a default product if needed
  INSERT INTO "Product" (id, barcode, name, created_at, updated_at)
  VALUES (
    gen_random_uuid(),
    'CUSTOM-DEFAULT',
    'Generic Product',
    NOW(),
    NOW()
  )
  ON CONFLICT (barcode) DO UPDATE SET id = "Product".id
  RETURNING id INTO default_product_id;

  -- Link remaining ingredients to default product
  UPDATE "RecipeIngredient"
  SET "productId" = default_product_id
  WHERE "productId" IS NULL;
END $$;

-- Step 4: Now make productId required and remove customName
ALTER TABLE "RecipeIngredient" ALTER COLUMN "productId" SET NOT NULL;
ALTER TABLE "RecipeIngredient" DROP COLUMN "customName";