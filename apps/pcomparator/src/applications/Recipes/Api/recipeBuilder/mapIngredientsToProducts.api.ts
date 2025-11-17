"use server";

import { IngredientMapperService } from "../../Application/Services/IngredientMapper.service";
import type { IngredientMapping } from "../../Application/Services/IngredientMapper.service";

const ingredientMapperService = new IngredientMapperService();

export interface MapIngredientsInput {
  ingredients: Array<{
    productName: string;
    quantity: number;
    unit: string;
  }>;
}

export interface MapIngredientsResult {
  success: boolean;
  mappings: IngredientMapping[];
  error?: string;
}

/**
 * Map ingredient names from recipe photo to database products
 */
export async function mapIngredientsToProducts(input: MapIngredientsInput): Promise<MapIngredientsResult> {
  try {
    const mappings = await ingredientMapperService.mapIngredients(input.ingredients);

    return {
      success: true,
      mappings
    };
  } catch (error) {
    console.error("Error mapping ingredients to products:", error);
    return {
      success: false,
      mappings: [],
      error: error instanceof Error ? error.message : "Unknown error"
    };
  }
}
