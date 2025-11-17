import type { Category } from "~/applications/Prices/Domain/Entities/Category";

export interface CategoryRepository {
  create(category: Category): Promise<Category>;

  findUnique(name: string): Promise<Category | null>;
}
