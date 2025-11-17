import { PantryItem } from "../../Domain/Entities/PantryItem.entity";
import {
  PantryItemNotFoundError,
  PantryItemUnauthorizedError,
  PantryItemValidationError
} from "../../Domain/Errors/PantryItemErrors";
import type { PantryItemRepository } from "../../Domain/Repositories/PantryItemRepository";
import type { CreatePantryItemInput, UpdatePantryItemInput } from "../../Domain/Schemas/PantryItem.schema";

export class PantryApplicationService {
  constructor(private readonly pantryItemRepository: PantryItemRepository) {}

  async getPantryItemsByUserId(userId: string): Promise<PantryItem[]> {
    try {
      const items = await this.pantryItemRepository.findByUserId(userId);
      return items;
    } catch (error) {
      throw new Error(
        `Failed to get pantry items: ${error instanceof Error ? error.message : "Unknown error"}`
      );
    }
  }

  async getPantryItemById(id: string, userId: string): Promise<PantryItem> {
    const item = await this.pantryItemRepository.findById(id);

    if (!item) {
      throw new PantryItemNotFoundError(id);
    }

    if (item.userId !== userId) {
      throw new PantryItemUnauthorizedError();
    }

    return item;
  }

  async createPantryItem(
    userId: string,
    input: CreatePantryItemInput & { productId?: string }
  ): Promise<PantryItem> {
    try {
      if (!input.name || input.name.trim().length === 0) {
        throw new PantryItemValidationError("Name is required");
      }

      if (input.quantity <= 0) {
        throw new PantryItemValidationError("Quantity must be positive");
      }

      const expiration = input.expiration ? new Date(input.expiration) : undefined;

      const pantryItem = PantryItem.create({
        userId,
        productId: input.productId,
        name: input.name,
        quantity: input.quantity,
        unit: input.unit,
        expiration,
        location: input.location || undefined
      });

      return await this.pantryItemRepository.create(pantryItem);
    } catch (error) {
      if (error instanceof PantryItemValidationError) {
        throw error;
      }
      throw new Error(
        `Failed to create pantry item: ${error instanceof Error ? error.message : "Unknown error"}`
      );
    }
  }

  async updatePantryItem(id: string, userId: string, input: UpdatePantryItemInput): Promise<PantryItem> {
    try {
      const existingItem = await this.getPantryItemById(id, userId);

      if (input.name !== undefined && input.name.trim().length === 0) {
        throw new PantryItemValidationError("Name cannot be empty");
      }

      if (input.quantity !== undefined && input.quantity <= 0) {
        throw new PantryItemValidationError("Quantity must be positive");
      }

      const updates: {
        name?: string;
        quantity?: number;
        unit?: string;
        expiration?: Date | null;
        location?: string;
      } = {};

      if (input.name !== undefined) {
        updates.name = input.name;
      }

      if (input.quantity !== undefined) {
        updates.quantity = input.quantity;
      }

      if (input.unit !== undefined) {
        updates.unit = input.unit;
      }

      if (input.expiration !== undefined) {
        updates.expiration = input.expiration ? new Date(input.expiration) : null;
      }

      if (input.location !== undefined) {
        updates.location = input.location || "pantry";
      }

      const updatedItem = existingItem.withUpdates(updates);

      return await this.pantryItemRepository.update(updatedItem);
    } catch (error) {
      if (error instanceof PantryItemNotFoundError || error instanceof PantryItemUnauthorizedError) {
        throw error;
      }
      throw new Error(
        `Failed to update pantry item: ${error instanceof Error ? error.message : "Unknown error"}`
      );
    }
  }

  async deletePantryItem(id: string, userId: string): Promise<void> {
    try {
      const existingItem = await this.getPantryItemById(id, userId);

      await this.pantryItemRepository.delete(existingItem.id);
    } catch (error) {
      if (error instanceof PantryItemNotFoundError || error instanceof PantryItemUnauthorizedError) {
        throw error;
      }
      throw new Error(
        `Failed to delete pantry item: ${error instanceof Error ? error.message : "Unknown error"}`
      );
    }
  }

  async getExpiringSoonItems(userId: string, days = 7): Promise<PantryItem[]> {
    try {
      return await this.pantryItemRepository.findExpiringSoonByUserId(userId, days);
    } catch (error) {
      throw new Error(
        `Failed to get expiring items: ${error instanceof Error ? error.message : "Unknown error"}`
      );
    }
  }
}
