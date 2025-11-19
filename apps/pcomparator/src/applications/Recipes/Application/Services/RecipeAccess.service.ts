import type { Recipe } from "~/applications/Recipes/Domain/Entities/Recipe.entity";
import type {
  RecipeAccessContext,
  RecipeRepository
} from "~/applications/Recipes/Domain/Repositories/RecipeRepository";

export interface RecipeAccessResult {
  recipe: Recipe | null;
  hasAccess: boolean;
  mode: "public" | "authenticated" | "shared" | "restricted";
  reason?: "public" | "owner" | "collaborator" | "share_token" | "private" | "not_found";
  requiresLogin: boolean;
}

export class RecipeAccessApplicationService {
  constructor(private readonly recipeRepository: RecipeRepository) {}

  public async getRecipeWithAccessCheck(
    recipeId: string,
    context: RecipeAccessContext
  ): Promise<RecipeAccessResult> {
    const accessCheck = await this.recipeRepository.checkUserAccess(recipeId, context);

    if (!accessCheck.recipe) {
      return {
        recipe: null,
        hasAccess: false,
        mode: "restricted",
        reason: "not_found",
        requiresLogin: false
      };
    }

    const recipe = accessCheck.recipe;

    if (!accessCheck.hasAccess) {
      return {
        recipe,
        hasAccess: false,
        mode: "restricted",
        reason: accessCheck.reason || "private",
        requiresLogin: true
      };
    }

    let mode: "public" | "authenticated" | "shared" | "restricted" = "restricted";

    switch (accessCheck.reason) {
      case "public":
        mode = "public";
        break;
      case "owner":
      case "collaborator":
        mode = "authenticated";
        break;
      case "share_token":
        mode = "shared";
        break;
    }

    return {
      recipe,
      hasAccess: true,
      mode,
      reason: accessCheck.reason,
      requiresLogin: false
    };
  }

  public async getRecipeByShareToken(shareToken: string): Promise<Recipe | null> {
    return await this.recipeRepository.findByShareToken(shareToken);
  }

  public async canUserModifyRecipe(recipeId: string, userId: string): Promise<boolean> {
    const recipe = await this.recipeRepository.findById(recipeId);
    if (!recipe) return false;

    return recipe.canUserModify(userId);
  }

  public async canUserViewRecipe(recipeId: string, userId?: string, shareToken?: string): Promise<boolean> {
    const context: RecipeAccessContext = {
      userId,
      shareToken,
      isAuthenticated: !!userId
    };

    const accessCheck = await this.recipeRepository.checkUserAccess(recipeId, context);
    return accessCheck.hasAccess;
  }

  public async getRecipeAccessMode(
    recipe: Recipe,
    userId?: string
  ): Promise<"public" | "authenticated" | "private"> {
    if (recipe.isPublic) {
      return "public";
    }

    if (userId && (recipe.isOwner(userId) || recipe.isUserCollaborator(userId))) {
      return "authenticated";
    }

    return "private";
  }
}
