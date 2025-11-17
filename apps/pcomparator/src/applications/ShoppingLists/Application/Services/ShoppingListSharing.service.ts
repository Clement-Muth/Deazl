import { auth } from "@deazl/system";
import { AuthenticationService } from "~/applications/Shared/Application/Services/Authentication.service";
import { DomainError } from "~/applications/Shared/Domain/Core/DomainError";
import type { CollaboratorRole } from "../../Domain/Entities/ShoppingListCollaborator.entity";
import type { ShoppingListRepository } from "../../Domain/Repositories/ShoppingListRepository";
import type { ShoppingListSharingRepository } from "../../Domain/Repositories/ShoppingListSharingRepository";
import type {
  AddCollaboratorPayload,
  GetCollaboratorsPayload
} from "../../Domain/Schemas/ShoppingListSharing.schema";
import { CollaboratorRoleValidator } from "../../Domain/ValueObjects/CollaboratorRoleValidator.vo";

export class ShoppingListSharingApplicationService {
  private readonly authService: AuthenticationService;

  constructor(
    private readonly listRepository: ShoppingListRepository,
    private readonly sharingRepository: ShoppingListSharingRepository
  ) {
    this.authService = new AuthenticationService();
  }

  async shareList(payload: AddCollaboratorPayload): Promise<void> {
    try {
      const user: any = await this.authService.getCurrentUser();

      const list = await this.listRepository.findById(payload.shoppingListId);

      if (!list) throw new Error("Shopping list not found");

      if (!list.canUserShare(user.id)) throw new Error("Unauthorized - only owner can share list");

      if (!list.canBeShared()) throw new Error("List cannot be shared - list must have a name");

      if (!CollaboratorRoleValidator.isValid(payload.role)) throw new Error("Invalid collaborator role");

      const collaborators = await this.sharingRepository.getCollaborators(payload.shoppingListId);
      const existingCollaborator = collaborators.find((c: any) => c.userId === user.id);

      if (existingCollaborator)
        await this.sharingRepository.updateCollaboratorRole(
          payload.shoppingListId,
          user.id,
          payload.role as CollaboratorRole
        );
      else
        await this.sharingRepository.addCollaborator(
          payload.shoppingListId,
          user.id,
          payload.role as CollaboratorRole
        );
    } catch (error) {
      if (error instanceof DomainError) throw error;

      throw new Error("Error sharing list", { cause: error });
    }
  }

  async getListCollaborators(shoppingListId: GetCollaboratorsPayload) {
    try {
      const user: any = await this.authService.getCurrentUser();
      const list = await this.listRepository.findById(shoppingListId);

      if (!list) throw new Error("Shopping list not found");

      const userRole = list.getUserRole(user.id);

      if (!list.canUserView(user.id, userRole || undefined))
        throw new Error("Unauthorized - insufficient permissions to view collaborators");

      return this.sharingRepository.getCollaborators(shoppingListId);
    } catch (error) {
      if (error instanceof DomainError) throw error;

      throw new Error("Error retrieving collaborators", { cause: error });
    }
  }

  async removeCollaborator(listId: string, userId: string): Promise<void> {
    try {
      const session = await auth();
      if (!session?.user?.id) throw new Error("User not authenticated");

      const list = await this.listRepository.findById(listId);
      if (!list) throw new Error("Shopping list not found");

      if (!list.canUserShare(session.user.id!))
        throw new Error("Unauthorized - only owner can remove collaborators");

      if (userId === session.user.id) throw new Error("Owner cannot remove themselves from the list");

      await this.sharingRepository.removeCollaborator(listId, userId);
    } catch (error) {
      console.error("Error removing collaborator", error);
      throw error;
    }
  }

  async leaveSharedList(listId: string): Promise<void> {
    try {
      const session: any = await auth();
      if (!session?.user?.id) throw new Error("User not authenticated");

      const list = await this.listRepository.findById(listId);
      if (!list) throw new Error("Shopping list not found");

      if (list.userId === session.user.id)
        throw new Error("Owner cannot leave their own list - delete the list instead");

      const collaborators = await this.sharingRepository.getCollaborators(listId);
      const isCollaborator = collaborators.some((c: any) => c.userId === session.user.id);

      if (!isCollaborator) throw new Error("You are not a collaborator of this list");

      await this.sharingRepository.removeCollaborator(listId, session.user.id!);
    } catch (error) {
      console.error("Error leaving shared list", error);
      throw error;
    }
  }
}
