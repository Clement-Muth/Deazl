import type { ShoppingList } from "../Entities/ShoppingList.entity";
import type { ShoppingListQuery } from "../ValueObjects/ShoppingListQuery.vo";

export interface ShoppingListRepository {
  save(list: ShoppingList): Promise<ShoppingList>;
  findById(shoppingListId: string): Promise<ShoppingList | null>;
  findManyByQuery(query: ShoppingListQuery): Promise<ShoppingList[]>;
  remove(shoppingListId: string): Promise<void>;
}
