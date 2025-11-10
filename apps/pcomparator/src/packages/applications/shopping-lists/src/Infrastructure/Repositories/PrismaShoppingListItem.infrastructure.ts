import { prisma } from "@deazl/system";
import type { ShoppingListItem } from "../../Domain/Entities/ShoppingListItem.entity";
import type { ShoppingListItemRepository } from "../../Domain/Repositories/ShoppingListItemRepository";
import { ShoppingListItemMapper } from "../../Infrastructure/Mappers/ShoppingListItemMapper";

/**
 * Implémentation Prisma du repository pour les articles de listes de courses
 *
 * Responsabilités (selon les principes DDD) :
 * - Persister et récupérer les entités ShoppingListItem
 * - Gérer les opérations CRUD sur les articles
 * - Mapper entre le modèle de domaine et le modèle de persistance
 *
 * Ce repository se concentre uniquement sur les opérations liées aux articles
 * et ne gère pas les entités d'autres bounded contexts (Product, Brand, Store)
 */
export class PrismaShoppingListItemRepository implements ShoppingListItemRepository {
  async addItem(listId: string, item: ShoppingListItem): Promise<ShoppingListItem> {
    const itemData = ShoppingListItemMapper.toPersistence(item);

    const newItem = await prisma.shoppingListItem.create({
      data: {
        shoppingListId: listId,
        productId: itemData.productId,
        quantity: itemData.quantity,
        unit: itemData.unit,
        isCompleted: itemData.isCompleted,
        customName: itemData.customName,
        price: itemData.price
        // notes: itemData.notes
      }
    });

    return ShoppingListItemMapper.toDomain(newItem);
  }

  async updateItem(item: ShoppingListItem): Promise<ShoppingListItem> {
    const itemData = ShoppingListItemMapper.toPersistence(item);

    const updatedItem = await prisma.shoppingListItem.update({
      where: { id: item.id },
      data: {
        quantity: itemData.quantity,
        unit: itemData.unit,
        isCompleted: itemData.isCompleted,
        customName: itemData.customName,
        price: itemData.price,
        // notes: itemData.notes,
        updatedAt: new Date()
      }
    });

    return ShoppingListItemMapper.toDomain(updatedItem);
  }

  async removeItem(itemId: string): Promise<void> {
    await prisma.shoppingListItem.delete({
      where: { id: itemId }
    });
  }

  async findItemById(id: string): Promise<ShoppingListItem | null> {
    const item = await prisma.shoppingListItem.findUnique({
      where: { id }
    });

    if (!item) return null;

    return ShoppingListItemMapper.toDomain(item);
  }

  async removeRecipeItems(listId: string, recipeId: string): Promise<number> {
    const result = await prisma.shoppingListItem.deleteMany({
      where: {
        shoppingListId: listId,
        recipeId
      }
    });

    return result.count;
  }
}
