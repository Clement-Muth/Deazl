import type { PantryItem } from "../Entities/PantryItem.entity";

export interface PantryItemRepository {
  findById(id: string): Promise<PantryItem | null>;
  findByUserId(userId: string): Promise<PantryItem[]>;
  findByUserIdAndProductId(userId: string, productId: string): Promise<PantryItem[]>;
  create(pantryItem: PantryItem): Promise<PantryItem>;
  update(pantryItem: PantryItem): Promise<PantryItem>;
  delete(id: string): Promise<void>;
  findExpiringSoonByUserId(userId: string, days: number): Promise<PantryItem[]>;
}
