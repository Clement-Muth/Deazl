import type { ShoppingListItemPayload } from "../Entities/ShoppingListItem.entity";

export interface RecipeGroup {
  recipeId: string | null;
  recipeName: string | null;
  items: ShoppingListItemPayload[];
  stats: RecipeGroupStats;
}

export interface RecipeGroupStats {
  totalItems: number;
  completedItems: number;
  totalPrice: number;
}

/**
 * Groups shopping list items by their associated recipe
 * Items without a recipeId are grouped under a null recipeId
 */
export function groupItemsByRecipe(items: ShoppingListItemPayload[]): RecipeGroup[] {
  const groups = new Map<string | null, ShoppingListItemPayload[]>();

  for (const item of items) {
    const key = item.recipeId ?? null;
    const existing = groups.get(key);
    if (existing) {
      existing.push(item);
    } else {
      groups.set(key, [item]);
    }
  }

  const recipeGroups: RecipeGroup[] = [];

  for (const [recipeId, groupItems] of groups.entries()) {
    const recipeName = groupItems[0]?.recipeName ?? null;
    const stats = calculateRecipeStats(groupItems);

    recipeGroups.push({
      recipeId,
      recipeName,
      items: groupItems,
      stats
    });
  }

  return sortRecipeGroups(recipeGroups);
}

/**
 * Calculates statistics for a group of items
 */
export function calculateRecipeStats(items: ShoppingListItemPayload[]): RecipeGroupStats {
  let totalItems = 0;
  let completedItems = 0;
  const totalPrice = 0; // TODO: Calculer le prix depuis les données Product

  for (const item of items) {
    totalItems++;
    if (item.isCompleted) {
      completedItems++;
    }
  }

  return {
    totalItems,
    completedItems,
    totalPrice
  };
}

/**
 * Sorts recipe groups:
 * 1. Groups with recipes (alphabetically by recipe name)
 * 2. Ungrouped items (null recipeId) last
 */
export function sortRecipeGroups(groups: RecipeGroup[]): RecipeGroup[] {
  return groups.sort((a, b) => {
    // Ungrouped items (null recipeId) always go last
    if (a.recipeId === null && b.recipeId !== null) return 1;
    if (a.recipeId !== null && b.recipeId === null) return -1;

    // Both null - maintain order
    if (a.recipeId === null && b.recipeId === null) return 0;

    // Both have recipes - sort alphabetically by name
    const nameA = a.recipeName ?? "";
    const nameB = b.recipeName ?? "";
    return nameA.localeCompare(nameB);
  });
}
