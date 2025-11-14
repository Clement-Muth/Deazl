"use server";

import { prisma } from "@deazl/system";
import { z } from "zod";
import { Currency } from "~/applications/Prices/Domain/ValueObjects/Currency";
import { PrismaBrandRepository } from "~/applications/Prices/Infrastructure/Repositories/PrismaBrandRepository";
import { PrismaCategoryRepository } from "~/applications/Prices/Infrastructure/Repositories/PrismaCategoryRepository";
import { PrismaPriceRepository } from "~/applications/Prices/Infrastructure/Repositories/PrismaPriceRepository";
import { PrismaProductRepository } from "~/applications/Prices/Infrastructure/Repositories/PrismaProductRepository";
import { PrismaStoreRepository } from "~/applications/Prices/Infrastructure/Repositories/PrismaStoreRepository";
import { parseOpenFoodFactsQuality } from "~/packages/applications/shopping-lists/src/Domain/ValueObjects/ProductQuality.vo";

const ParamsSchema = z.object({
  productId: z.string().optional(),
  productName: z.string(),
  barcode: z.string().optional(),
  storeName: z.string(),
  location: z.string(),
  amount: z.number().positive(),
  unit: z.string().default("unit"),
  proof: z.instanceof(Blob).optional(),
  currency: z.nativeEnum(Currency)
});

const PayloadSchema = z.object({
  name: z.string()
});

export type CreatePriceParams = z.infer<typeof ParamsSchema>;
export type CreatePricePayload = z.infer<typeof PayloadSchema>;

export const createPrice = async (params: CreatePriceParams): Promise<CreatePricePayload> => {
  try {
    const paramsPayload = ParamsSchema.parse(params);

    // Use repositories directly instead of HTTP call (we're already server-side)
    const categoryRepository = new PrismaCategoryRepository();
    const brandRepository = new PrismaBrandRepository();
    const productRepository = new PrismaProductRepository();
    const storeRepository = new PrismaStoreRepository();
    const priceRepository = new PrismaPriceRepository();

    let product: any;
    let proofImage: string | null = null;

    // If productId is provided, use it directly
    if (paramsPayload.productId) {
      product = { id: paramsPayload.productId, name: paramsPayload.productName };
    }
    // Otherwise, create/find product by barcode from Open Food Facts
    else if (paramsPayload.barcode) {
      // Utiliser l'API v2 d'OpenFoodFacts directement
      const offResponse = await fetch(
        `https://world.openfoodfacts.org/api/v2/product/${paramsPayload.barcode}.json`
      );

      if (!offResponse.ok) {
        throw new Error(`OpenFoodFacts API error: ${offResponse.statusText}`);
      }

      const offData = await offResponse.json();

      if (!offData.product) {
        throw new Error(`Product not found in OpenFoodFacts: ${paramsPayload.barcode}`);
      }

      const offProduct = offData.product;
      proofImage = offProduct.image_url || offProduct.image_front_url || null;

      // Extract quality data from OpenFoodFacts
      const qualityData = parseOpenFoodFactsQuality(offProduct);

      const category = await categoryRepository.findOrCreate("N/A", {
        description: "",
        name: "N/A"
      });

      const brandName = offProduct.brands || offProduct.brands_tags?.[0] || "Unknown";
      const brand = await brandRepository.findOrCreate(brandName, {
        description: "",
        name: brandName
      });

      const productName =
        offProduct.product_name ||
        offProduct.product_name_fr ||
        offProduct.product_name_en ||
        "Unknown Product";
      product = await productRepository.findOrCreate(paramsPayload.barcode, {
        name: productName,
        categoryId: category.id,
        brandId: brand.id,
        barcode: paramsPayload.barcode,
        nutritionScore: qualityData // Store enriched quality data
      });
    } else {
      throw new Error("Either productId or barcode must be provided");
    }

    // Convert proof Blob to base64 if provided
    if (paramsPayload.proof) {
      const buffer = await paramsPayload.proof.arrayBuffer();
      const base64 = Buffer.from(buffer).toString("base64");
      const mimeType = paramsPayload.proof.type || "image/jpeg";
      proofImage = `data:${mimeType};base64,${base64}`;
    }

    const store = await storeRepository.findOrCreate(paramsPayload.location, paramsPayload.storeName, {
      location: paramsPayload.location,
      name: paramsPayload.storeName
    });

    const createdPrice = await priceRepository.create({
      productId: product.id,
      storeId: store.id,
      amount: paramsPayload.amount,
      currency: paramsPayload.currency,
      unit: paramsPayload.unit,
      priceProofImage: proofImage
    });

    // Auto-select this price for all shopping list items that have this product but no selected price yet
    try {
      await prisma.shoppingListItem.updateMany({
        where: {
          productId: product.id,
          selectedPriceId: null
        },
        data: {
          selectedPriceId: createdPrice.id
        }
      });
    } catch (error) {
      console.warn("Failed to auto-select price for shopping list items:", error);
      // Non-blocking error - price is still created
    }

    return { name: product.name };
  } catch (error) {
    console.error("Error in createPrice:", error);
    if (error instanceof Error) {
      console.error("Error message:", error.message);
      console.error("Error stack:", error.stack);
    }
    throw new Error(`Failed to create price: ${error instanceof Error ? error.message : "Unknown error"}`, {
      cause: error
    });
  }
};
