import { AuthenticationService, DataAccessError, DomainError } from "@deazl/shared";
import { ShoppingList } from "../../Domain/Entities/ShoppingList.entity";
import type { ShoppingListRepository } from "../../Domain/Repositories/ShoppingListRepository";
import type {
  CreateShoppingListPayload,
  DeleteShoppingListPayload,
  GetShoppingListPayload,
  UpdateShoppingListPayload
} from "../../Domain/Schemas/ShoppingList.schema";
import { ShoppingListQuery } from "../../Domain/ValueObjects/ShoppingListQuery.vo";

export class ShoppingListApplicationService {
  private readonly authService: AuthenticationService;

  constructor(private readonly repository: ShoppingListRepository) {
    this.authService = new AuthenticationService();
  }

  async listUserShoppingLists(): Promise<ShoppingList[]> {
    try {
      const currentUser: any = await this.authService.getCurrentUser();

      const lists = await this.repository.findManyByQuery(ShoppingListQuery.forUserAccess(currentUser.id));

      return lists;
    } catch (error) {
      if (error instanceof DomainError) throw error;

      throw new DataAccessError(
        "Failed to list user shopping lists",
        error instanceof Error ? error : new Error(String(error))
      );
    }
  }

  async getShoppingList(shoppingListId: GetShoppingListPayload): Promise<ShoppingList | null> {
    try {
      const currentUser: any = await this.authService.getCurrentUser();

      const list = await this.repository.findById(shoppingListId);

      if (!list) return null;

      if (!list.isUserCollaborator(currentUser.id) && !list.isPublic)
        throw new Error("Shopping list not found or you do not have access to it");

      return list;
    } catch (error) {
      if (error instanceof DomainError) throw error;

      throw new Error("Unexpected error retrieving shopping list", { cause: error });
    }
  }

  async createShoppingList(data: CreateShoppingListPayload): Promise<ShoppingList> {
    try {
      const currentUser: any = await this.authService.getCurrentUser();

      const shoppingList = ShoppingList.create({
        name: data.name,
        userId: currentUser.id
      });

      return this.repository.save(shoppingList);
    } catch (error) {
      if (error instanceof DomainError) throw error;

      throw new Error("Unexpected error creating shopping list", { cause: error });
    }
  }

  async deleteShoppingList(shoppingListId: DeleteShoppingListPayload): Promise<void> {
    try {
      const currentUser: any = await this.authService.getCurrentUser();

      const list = await this.repository.findById(shoppingListId);

      if (!list) throw new Error("Shopping list not found");

      if (!list.isOwner(currentUser.id)) throw new Error("Unauthorized - only owner can delete list");

      await this.repository.remove(shoppingListId);
    } catch (error) {
      if (error instanceof DomainError) throw error;

      throw new Error("Unexpected error deleting shopping list", { cause: error });
    }
  }

  async updateShoppingList(shoppingListId: string, data: UpdateShoppingListPayload): Promise<ShoppingList> {
    try {
      const currentUser: any = await this.authService.getCurrentUser();

      const list = await this.repository.findById(shoppingListId);

      if (!list) throw new Error("Shopping list not found");

      const userRole = list.getUserRole(currentUser.id);

      if (!list.canUserModify(currentUser.id, userRole || undefined))
        throw new Error("Unauthorized - insufficient permissions to modify list");

      const updatedList = list.withUpdates({ name: data.name });

      return this.repository.save(updatedList);
    } catch (error) {
      if (error instanceof DomainError) throw error;

      throw new Error("Unexpected error updating shopping list", { cause: error });
    }
  }
}
