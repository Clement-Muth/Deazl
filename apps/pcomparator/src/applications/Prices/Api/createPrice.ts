"use server";

import { OpenFoodFactPricesApiClient } from "@deazl/system";
import { z } from "zod";
import { Currency } from "~/applications/Prices/Domain/ValueObjects/Currency";
import { PrismaBrandRepository } from "~/applications/Prices/Infrastructure/Repositories/PrismaBrandRepository";
import { PrismaCategoryRepository } from "~/applications/Prices/Infrastructure/Repositories/PrismaCategoryRepository";
import { PrismaPriceRepository } from "~/applications/Prices/Infrastructure/Repositories/PrismaPriceRepository";
import { PrismaProductRepository } from "~/applications/Prices/Infrastructure/Repositories/PrismaProductRepository";
import { PrismaStoreRepository } from "~/applications/Prices/Infrastructure/Repositories/PrismaStoreRepository";

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

    console.log("Creating price with params:", paramsPayload);

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
      console.log("Using existing product with ID:", paramsPayload.productId);
      product = { id: paramsPayload.productId, name: paramsPayload.productName };
    }
    // Otherwise, create/find product by barcode from Open Food Facts
    else if (paramsPayload.barcode) {
      console.log("Fetching product from Open Food Facts:", paramsPayload.barcode);

      const offProduct = await OpenFoodFactPricesApiClient.get(
        `products/code/${paramsPayload.barcode}`
      ).json<{
        product_name: string;
        brands: string;
        image_url: string;
      }>();

      console.log("OFF Product data:", offProduct);
      proofImage = offProduct.image_url;

      const category = await categoryRepository.findOrCreate("N/A", {
        description: "",
        name: "N/A"
      });

      const brand = await brandRepository.findOrCreate(offProduct.brands, {
        description: "",
        name: offProduct.brands
      });

      product = await productRepository.findOrCreate(paramsPayload.barcode, {
        name: offProduct.product_name,
        categoryId: category.id,
        brandId: brand.id,
        barcode: paramsPayload.barcode
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

    await priceRepository.create({
      productId: product.id,
      storeId: store.id,
      amount: paramsPayload.amount,
      currency: paramsPayload.currency,
      unit: paramsPayload.unit,
      priceProofImage: proofImage
    });

    console.log("Price created successfully for product:", product.name);

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
