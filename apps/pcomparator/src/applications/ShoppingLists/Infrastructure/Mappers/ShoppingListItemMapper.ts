import { ShoppingListItem } from "../../Domain/Entities/ShoppingListItem.entity";

export class ShoppingListItemMapper {
  static toDomain(raw: any): ShoppingListItem {
    return ShoppingListItem.create(
      {
        shoppingListId: raw.shoppingListId,
        productId: raw.productId,
        quantity: raw.quantity,
        unit: raw.unit,
        isCompleted: raw.isCompleted,
        notes: raw.notes,
        selectedPriceId: raw.selectedPriceId || null,
        // @ts-ignore
        selectedPrice: raw.selectedPrice
          ? {
              id: raw.selectedPrice.id,
              amount: raw.selectedPrice.amount,
              currency: raw.selectedPrice.currency,
              unit: raw.selectedPrice.unit,
              store: raw.selectedPrice.store
                ? {
                    id: raw.selectedPrice.store.id,
                    name: raw.selectedPrice.store.name,
                    location: raw.selectedPrice.store.location
                  }
                : undefined
            }
          : undefined
      },
      raw.id
    );
  }

  static toPersistence(entity: ShoppingListItem): any {
    return {
      id: entity.id,
      shoppingListId: entity.shoppingListId,
      productId: entity.productId,
      quantity: entity.quantity,
      unit: entity.unit,
      isCompleted: entity.isCompleted,
      notes: entity.notes,
      selectedPriceId: entity.selectedPriceId || null,
      updatedAt: new Date()
    };
  }
}
