import { ShoppingList } from "../../Domain/Entities/ShoppingList.entity";
import {
  CollaboratorRole,
  ShoppingListCollaborator
} from "../../Domain/Entities/ShoppingListCollaborator.entity";
import { ShoppingListItem } from "../../Domain/Entities/ShoppingListItem.entity";
import type { ShoppingListInfraPayload } from "../../Infrastructure/Schemas/ShoppingList.schema";

export class ShoppingListMapper {
  static toDomain(raw: ShoppingListInfraPayload): ShoppingList {
    const itemEntities =
      raw.items?.map((item) =>
        ShoppingListItem.create(
          {
            shoppingListId: raw.id,
            productId: item.productId,
            recipeId: item.recipeId,
            quantity: item.quantity,
            unit: item.unit,
            isCompleted: item.isCompleted,
            selectedPriceId: item.selectedPriceId ?? null,
            notes: item.notes ?? null,
            product: item.product
              ? {
                  id: item.product.id,
                  name: item.product.name,
                  barcode: item.product.barcode,
                  description: item.product.description
                }
              : undefined,
            selectedPrice: item.selectedPrice
              ? {
                  id: item.selectedPrice.id,
                  amount: item.selectedPrice.amount,
                  currency: item.selectedPrice.currency,
                  unit: item.selectedPrice.unit,
                  store: item.selectedPrice.store
                }
              : null
          },
          item.id
        )
      ) || [];

    const collaborators = raw.collaborators.map(
      (collaborator) =>
        ShoppingListCollaborator.create(
          {
            listId: collaborator.listId,
            userId: collaborator.userId,
            role: CollaboratorRole[collaborator.role as keyof typeof CollaboratorRole],
            createdAt: collaborator.createdAt,
            updatedAt: collaborator.updatedAt
          },
          collaborator.id
        ) || []
    );

    return ShoppingList.create(
      {
        name: raw.name,
        description: raw.description ?? undefined,
        userId: raw.userId,
        items: itemEntities,
        collaborators: collaborators
      },
      raw.id
    );
  }

  static toPersistence(entity: ShoppingList) {
    return {
      id: entity.id,
      name: entity.name,
      description: entity.description,
      userId: entity.userId,
      createdAt: entity.createdAt,
      updatedAt: new Date()
    };
  }

  static toDTO(entity: ShoppingList) {
    return {
      ...entity.toObject(),
      totalItems: entity.totalItems,
      completedItems: entity.completedItems,
      progressPercentage: entity.progressPercentage,
      totalPrice: entity.totalPrice,
      totalPendingPrice: entity.totalPendingPrice,
      totalCompletedPrice: entity.totalCompletedPrice,
      isEmpty: entity.isEmpty()
    };
  }
}
