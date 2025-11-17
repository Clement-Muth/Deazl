"use server";

import { v4 as uuidv4 } from "uuid";
import { z } from "zod";
import { PrismaProductRepository } from "../../Infrastructure/Repositories/PrismaProductRepository";

const productRepository = new PrismaProductRepository();

const CreateProductSchema = z.object({
  name: z.string().min(1, "Product name is required"),
  barcode: z.string().optional(),
  categoryId: z.string().uuid().optional(),
  brandId: z.string().uuid().optional(),
  description: z.string().optional()
});

export type CreateProductInput = z.infer<typeof CreateProductSchema>;

export interface CreateProductResult {
  success: boolean;
  product?: {
    id: string;
    name: string;
    barcode: string;
    brand?: {
      id: string;
      name: string;
    };
    category?: {
      id: string;
      name: string;
    };
  };
  error?: string;
}

/**
 * Create a new product for recipe ingredients
 */
export async function createProductForRecipe(input: CreateProductInput): Promise<CreateProductResult> {
  try {
    const validated = CreateProductSchema.parse(input);

    // Generate barcode if not provided
    const barcode = validated.barcode || `CUSTOM-${uuidv4()}`;

    // Check if barcode already exists
    const existing = await productRepository.findByBarcode(barcode);
    if (existing) {
      return {
        success: false,
        error: "A product with this barcode already exists"
      };
    }

    const product = await productRepository.createProduct({
      ...validated,
      barcode
    });

    return {
      success: true,
      product
    };
  } catch (error) {
    console.error("Error creating product:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to create product"
    };
  }
}
