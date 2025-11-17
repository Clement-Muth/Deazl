import type { Category, CreateCategory } from "~/applications/Prices/Domain/Entities/Category";
import { prisma } from "~/libraries/prisma";

export class PrismaCategoryRepository {
  async create(category: CreateCategory): Promise<Category> {
    const createdCategory = await prisma.category.create({
      data: {
        name: category.name,
        description: category.description,
        parent_category_id: category.parentCategoryId
      }
    });

    return {
      id: createdCategory.id,
      description: createdCategory.description,
      name: createdCategory.name,
      parentCategoryId: createdCategory.parent_category_id
    };
  }

  async findUnique(name: string): Promise<Category | null> {
    const foundCategory = await prisma.category.findUnique({
      where: { name }
    });

    return foundCategory
      ? {
          id: foundCategory.id,
          description: foundCategory.description,
          name: foundCategory.name,
          parentCategoryId: foundCategory.parent_category_id
        }
      : null;
  }

  async findOrCreate(name: string, categoryData: CreateCategory) {
    let category = await this.findUnique(name);

    if (!category) category = await this.create(categoryData);

    return category;
  }
}
