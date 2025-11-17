import type { PantryItem as PrismaPantryItem } from "@prisma/client";
import { PantryItem } from "../../Domain/Entities/PantryItem.entity";
import type { PantryItemPayload } from "../../Domain/Schemas/PantryItem.schema";

export class PantryItemMapper {
  public static toDomain(raw: PrismaPantryItem): PantryItem {
    return PantryItem.create(
      {
        userId: raw.userId,
        productId: raw.productId || undefined,
        name: raw.name,
        quantity: raw.quantity,
        unit: raw.unit,
        expiration: raw.expiration || undefined,
        location: raw.location || undefined
      },
      raw.id
    );
  }

  public static toPersistence(pantryItem: PantryItem): Omit<PrismaPantryItem, "createdAt" | "updatedAt"> {
    return {
      id: pantryItem.id,
      userId: pantryItem.userId,
      productId: pantryItem.productId || null,
      name: pantryItem.name,
      quantity: pantryItem.quantity,
      unit: pantryItem.unit.toString(),
      expiration: pantryItem.expiration || null,
      location: pantryItem.location.toString()
    };
  }

  public static toPayload(pantryItem: PantryItem): PantryItemPayload {
    return pantryItem.toObject();
  }
}
