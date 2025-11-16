"use server";

import { auth } from "@deazl/system";
import { RecipeHubService } from "../../Application/Services/RecipeHub.service";
import type { RecipePayload } from "../../Domain/Schemas/Recipe.schema";

const hubService = new RecipeHubService();

export interface RecipeHubDataPayload {
  popular: RecipePayload[];
  quick: RecipePayload[];
  cheap: RecipePayload[];
  healthy: RecipePayload[];
  cellarBased: RecipePayload[];
  recommended: RecipePayload[];
  purchaseBased: RecipePayload[];
  new: RecipePayload[];
  categories: {
    name: string;
    slug: string;
    count: number;
    recipes: RecipePayload[];
  }[];
}

export const getRecipeHubData = async (): Promise<RecipeHubDataPayload> => {
  try {
    const session = await auth();
    const userId = session?.user?.id;

    const hubData = await hubService.getHubData(userId);

    return {
      popular: hubData.popular.map((r) => r.toObject()),
      quick: hubData.quick.map((r) => r.toObject()),
      cheap: hubData.cheap.map((r) => r.toObject()),
      healthy: hubData.healthy.map((r) => r.toObject()),
      cellarBased: hubData.cellarBased.map((r) => r.toObject()),
      recommended: hubData.recommended.map((r) => r.toObject()),
      purchaseBased: hubData.purchaseBased.map((r) => r.toObject()),
      new: hubData.new.map((r) => r.toObject()),
      categories: hubData.categories.map((cat) => ({
        ...cat,
        recipes: cat.recipes.map((r) => r.toObject())
      }))
    };
  } catch (error) {
    throw new Error("Failed to load recipe hub data", { cause: error });
  }
};
