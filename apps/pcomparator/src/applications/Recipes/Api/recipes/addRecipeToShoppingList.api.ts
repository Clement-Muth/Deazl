"use server";

import { z } from "zod";
import { addItemToList } from "~/applications/ShoppingLists/Api/items/addItemToList.api";
import { updateShoppingListItem } from "~/applications/ShoppingLists/Api/items/updateShoppingListItem.api";
import { getShoppingList } from "~/applications/ShoppingLists/Api/shoppingLists/getShoppingList.api";
import { normalizeUnit } from "~/core/shared/utils/unitNormalizer";
import { getRecipe } from "./getRecipe.api";

const AddRecipeToShoppingListSchema = z.object({
  recipeId: z.string().uuid("Invalid recipe ID"),
  listId: z.string().uuid("Invalid shopping list ID"),
  servingsMultiplier: z.number().positive().default(1),
  selectedIngredientIds: z.array(z.string().uuid()).optional()
});

export type AddRecipeToShoppingListPayload = z.infer<typeof AddRecipeToShoppingListSchema>;

interface MergeResult {
  merged: Array<{
    productId: string;
    productName: string;
    existingQuantity: number;
    newQuantity: number;
    totalQuantity: number;
    unit: string;
  }>;
  newItems: Array<{
    productId: string;
    productName: string;
    quantity: number;
    unit: string;
  }>;
}

/**
 * Détecte les doublons et calcule les quantités fusionnées
 */
async function detectMergeOpportunities(
  listId: string,
  recipeIngredients: Array<{ productId: string; productName?: string; quantity: number; unit: string }>
): Promise<MergeResult> {
  const list = await getShoppingList(listId);
  if (!list) {
    throw new Error("Shopping list not found");
  }
  const existingItems = list.items || [];

  const merged: MergeResult["merged"] = [];
  const newItems: MergeResult["newItems"] = [];

  for (const ingredient of recipeIngredients) {
    // Normaliser l'unité de l'ingrédient pour la comparaison
    const normalizedIngredientUnit = normalizeUnit(ingredient.unit);

    const existingItem = existingItems.find(
      (item) =>
        item.productId === ingredient.productId &&
        normalizeUnit(item.unit || "unit") === normalizedIngredientUnit
    );

    if (existingItem) {
      merged.push({
        productId: ingredient.productId,
        productName: ingredient.productName || existingItem.product?.name || "Unknown",
        existingQuantity: existingItem.quantity,
        newQuantity: ingredient.quantity,
        totalQuantity: existingItem.quantity + ingredient.quantity,
        unit: normalizedIngredientUnit
      });
    } else {
      newItems.push({
        productId: ingredient.productId,
        productName: ingredient.productName || "Unknown",
        quantity: ingredient.quantity,
        unit: normalizedIngredientUnit
      });
    }
  }

  return { merged, newItems };
}

/**
 * Ajoute une recette à une liste de courses avec gestion intelligente des doublons
 */
export async function addRecipeToShoppingList(data: AddRecipeToShoppingListPayload) {
  try {
    const validated = AddRecipeToShoppingListSchema.parse(data);
    const { recipeId, listId, servingsMultiplier, selectedIngredientIds } = validated;

    // Récupérer la recette
    const recipe = await getRecipe(recipeId);

    if (!recipe) {
      throw new Error("Recipe not found");
    }

    // Filtrer les ingrédients sélectionnés
    let ingredientsToAdd = recipe.ingredients || [];
    if (selectedIngredientIds && selectedIngredientIds.length > 0) {
      ingredientsToAdd = ingredientsToAdd.filter((ing) => selectedIngredientIds.includes(ing.id));
    }

    if (ingredientsToAdd.length === 0) {
      throw new Error("No ingredients to add");
    }

    // Préparer les ingrédients avec quantités ajustées et unités normalisées
    const adjustedIngredients = ingredientsToAdd.map((ing) => ({
      productId: ing.productId,
      productName: ing.productName,
      quantity: ing.quantity * servingsMultiplier,
      unit: normalizeUnit(ing.unit) // Normaliser l'unité
    }));

    // Détecter les opportunités de fusion
    const mergeResult = await detectMergeOpportunities(listId, adjustedIngredients);

    // Récupérer la liste actuelle pour mettre à jour les items existants
    const list = await getShoppingList(listId);
    if (!list) {
      throw new Error("Shopping list not found");
    }
    const existingItems = list.items || [];

    console.log("Merge result:", mergeResult);

    // Mettre à jour les items existants (fusion)
    for (const merge of mergeResult.merged) {
      const existingItem = existingItems.find(
        (item) =>
          item.productId === merge.productId &&
          normalizeUnit(item.unit || "unit") === normalizeUnit(merge.unit)
      );

      console.log("Merging item:", {
        productId: merge.productId,
        productName: merge.productName,
        existingQuantity: merge.existingQuantity,
        newQuantity: merge.newQuantity,
        totalQuantity: merge.totalQuantity,
        unit: merge.unit
      });

      if (existingItem) {
        await updateShoppingListItem(existingItem.id, {
          quantity: merge.totalQuantity,
          // Associer à la recette si l'item existant n'a pas encore de recipeId
          ...(existingItem.recipeId ? {} : { recipeId: recipe.id, recipeName: recipe.name })
        });
      }
    }

    // Ajouter les nouveaux items avec productId, recipeId et unités normalisées
    for (const newItem of mergeResult.newItems) {
      await addItemToList(listId, {
        productId: newItem.productId, // IMPORTANT: Ajouter le productId pour permettre le merge
        recipeId: recipe.id, // Associer l'item à la recette source
        recipeName: recipe.name, // Cache du nom pour affichage
        customName: newItem.productName,
        quantity: newItem.quantity,
        unit: normalizeUnit(newItem.unit), // Normaliser l'unité
        isCompleted: false
      });
    }

    return {
      success: true,
      recipe: {
        id: recipe.id,
        name: recipe.name
      },
      stats: {
        merged: mergeResult.merged.length,
        added: mergeResult.newItems.length,
        total: ingredientsToAdd.length
      },
      mergeDetails: mergeResult
    };
  } catch (error) {
    console.error("Error adding recipe to shopping list", error);

    if (error instanceof z.ZodError) {
      throw new Error(`Validation error: ${error.errors[0].message}`);
    }

    throw error;
  }
}
