import type { Store } from "~/applications/Prices/Domain/Entities/Store";

export interface StoreRepository {
  create(store: Store): Promise<Store>;

  findUnique(location: string, name: string): Promise<Store | null>;
}
