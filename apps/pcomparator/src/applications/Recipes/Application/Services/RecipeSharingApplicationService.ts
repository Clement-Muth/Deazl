import { AuthenticationService, DomainError } from "@deazl/shared";
import { auth } from "@deazl/system";
import type { RecipeRole } from "../../Domain/Entities/RecipeCollaborator.entity";
import type { RecipeRepository } from "../../Domain/Repositories/RecipeRepository";
import type { RecipeSharingRepository } from "../../Domain/Repositories/RecipeSharingRepository";
import type {
  AddCollaboratorPayload,
  GetCollaboratorsPayload
} from "../../Domain/Schemas/RecipeSharing.schema";
import { RecipeRoleValidator } from "../../Domain/ValueObjects/RecipeRoleValidator.vo";

export class RecipeSharingApplicationService {
  private readonly authService: AuthenticationService;

  constructor(
    private readonly recipeRepository: RecipeRepository,
    private readonly sharingRepository: RecipeSharingRepository
  ) {
    this.authService = new AuthenticationService();
  }

  async shareRecipe(payload: AddCollaboratorPayload): Promise<void> {
    try {
      const user: any = await this.authService.getCurrentUser();

      const recipe = await this.recipeRepository.findById(payload.recipeId);

      if (!recipe) throw new Error("Recipe not found");

      if (!recipe.canUserShare(user.id)) throw new Error("Unauthorized - only owner can share recipe");

      if (!recipe.canBeShared()) throw new Error("Recipe cannot be shared - recipe must have a name");

      if (!RecipeRoleValidator.isValid(payload.role)) throw new Error("Invalid collaborator role");

      const collaborators = await this.sharingRepository.getCollaborators(payload.recipeId);
      const existingCollaborator = collaborators.find((c: any) => c.userId === user.id);

      if (existingCollaborator)
        await this.sharingRepository.updateCollaboratorRole(
          payload.recipeId,
          user.id,
          payload.role as RecipeRole
        );
      else
        await this.sharingRepository.addCollaborator(
          payload.recipeId,
          payload.email,
          payload.role as RecipeRole
        );
    } catch (error) {
      if (error instanceof DomainError) throw error;

      throw new Error("Error sharing recipe", { cause: error });
    }
  }

  async getRecipeCollaborators(recipeId: GetCollaboratorsPayload) {
    try {
      const user: any = await this.authService.getCurrentUser();
      const recipe = await this.recipeRepository.findById(recipeId);

      if (!recipe) throw new Error("Recipe not found");

      const userRole = recipe.getUserRole(user.id);

      if (!recipe.canUserView(user.id, userRole || undefined))
        throw new Error("Unauthorized - insufficient permissions to view collaborators");

      return this.sharingRepository.getCollaborators(recipeId);
    } catch (error) {
      if (error instanceof DomainError) throw error;

      throw new Error("Error retrieving collaborators", { cause: error });
    }
  }

  async removeCollaborator(recipeId: string, userId: string): Promise<void> {
    try {
      const session = await auth();
      if (!session?.user?.id) throw new Error("User not authenticated");

      const recipe = await this.recipeRepository.findById(recipeId);
      if (!recipe) throw new Error("Recipe not found");

      if (!recipe.canUserShare(session.user.id!))
        throw new Error("Unauthorized - only owner can remove collaborators");

      if (userId === session.user.id) throw new Error("Owner cannot remove themselves from the recipe");

      await this.sharingRepository.removeCollaborator(recipeId, userId);
    } catch (error) {
      console.error("Error removing collaborator", error);
      throw error;
    }
  }

  async leaveSharedRecipe(recipeId: string): Promise<void> {
    try {
      const session: any = await auth();
      if (!session?.user?.id) throw new Error("User not authenticated");

      const recipe = await this.recipeRepository.findById(recipeId);
      if (!recipe) throw new Error("Recipe not found");

      if (recipe.userId === session.user.id)
        throw new Error("Owner cannot leave their own recipe - delete the recipe instead");

      const collaborators = await this.sharingRepository.getCollaborators(recipeId);
      const isCollaborator = collaborators.some((c: any) => c.userId === session.user.id);

      if (!isCollaborator) throw new Error("You are not a collaborator of this recipe");

      await this.sharingRepository.removeCollaborator(recipeId, session.user.id!);
    } catch (error) {
      console.error("Error leaving shared recipe", error);
      throw error;
    }
  }
}
