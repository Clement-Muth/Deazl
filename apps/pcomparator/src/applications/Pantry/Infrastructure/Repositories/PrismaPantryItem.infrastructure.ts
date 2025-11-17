import { prisma } from "@deazl/system";
import type { PantryItem } from "../../Domain/Entities/PantryItem.entity";
import type { PantryItemRepository } from "../../Domain/Repositories/PantryItemRepository";
import { PantryItemMapper } from "../Mappers/PantryItemMapper";

export class PrismaPantryItemRepository implements PantryItemRepository {
  async findById(id: string): Promise<PantryItem | null> {
    try {
      const pantryItem = await prisma.pantryItem.findUnique({
        where: { id }
      });

      if (!pantryItem) return null;

      return PantryItemMapper.toDomain(pantryItem);
    } catch (error) {
      throw new Error(
        `Failed to find pantry item: ${error instanceof Error ? error.message : "Unknown error"}`
      );
    }
  }

  async findByUserId(userId: string): Promise<PantryItem[]> {
    try {
      const pantryItems = await prisma.pantryItem.findMany({
        where: { userId },
        orderBy: [{ expiration: "asc" }, { createdAt: "desc" }]
      });

      return pantryItems.map((item) => PantryItemMapper.toDomain(item));
    } catch (error) {
      throw new Error(
        `Failed to find pantry items: ${error instanceof Error ? error.message : "Unknown error"}`
      );
    }
  }

  async findByUserIdAndProductId(userId: string, productId: string): Promise<PantryItem[]> {
    try {
      const pantryItems = await prisma.pantryItem.findMany({
        where: {
          userId,
          productId
        },
        orderBy: { createdAt: "desc" }
      });

      return pantryItems.map((item) => PantryItemMapper.toDomain(item));
    } catch (error) {
      throw new Error(
        `Failed to find pantry items: ${error instanceof Error ? error.message : "Unknown error"}`
      );
    }
  }

  async create(pantryItem: PantryItem): Promise<PantryItem> {
    try {
      const data = PantryItemMapper.toPersistence(pantryItem);

      const created = await prisma.pantryItem.create({
        data: {
          ...data,
          createdAt: new Date(),
          updatedAt: new Date()
        }
      });

      return PantryItemMapper.toDomain(created);
    } catch (error) {
      throw new Error(
        `Failed to create pantry item: ${error instanceof Error ? error.message : "Unknown error"}`
      );
    }
  }

  async update(pantryItem: PantryItem): Promise<PantryItem> {
    try {
      const data = PantryItemMapper.toPersistence(pantryItem);

      const updated = await prisma.pantryItem.update({
        where: { id: pantryItem.id },
        data: {
          ...data,
          updatedAt: new Date()
        }
      });

      return PantryItemMapper.toDomain(updated);
    } catch (error) {
      throw new Error(
        `Failed to update pantry item: ${error instanceof Error ? error.message : "Unknown error"}`
      );
    }
  }

  async delete(id: string): Promise<void> {
    try {
      await prisma.pantryItem.delete({
        where: { id }
      });
    } catch (error) {
      throw new Error(
        `Failed to delete pantry item: ${error instanceof Error ? error.message : "Unknown error"}`
      );
    }
  }

  async findExpiringSoonByUserId(userId: string, days: number): Promise<PantryItem[]> {
    try {
      const expirationDate = new Date();
      expirationDate.setDate(expirationDate.getDate() + days);

      const pantryItems = await prisma.pantryItem.findMany({
        where: {
          userId,
          expiration: {
            lte: expirationDate,
            gte: new Date()
          }
        },
        orderBy: { expiration: "asc" }
      });

      return pantryItems.map((item) => PantryItemMapper.toDomain(item));
    } catch (error) {
      throw new Error(
        `Failed to find expiring pantry items: ${error instanceof Error ? error.message : "Unknown error"}`
      );
    }
  }
}
