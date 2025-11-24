import { prisma } from "@deazl/system";
import { IngredientGroup } from "../../Domain/Entities/IngredientGroup.entity";
import { Recipe } from "../../Domain/Entities/Recipe.entity";
import { RecipeIngredient } from "../../Domain/Entities/RecipeIngredient.entity";
import { RecipeStep } from "../../Domain/Entities/RecipeStep.entity";
import { StepGroup } from "../../Domain/Entities/StepGroup.entity";
import type {
  RecipeAccessContext,
  RecipeRepository,
  RecipeSearchFilters,
  RecipeTrendingData
} from "../../Domain/Repositories/RecipeRepository";
import type { DifficultyLevel } from "../../Domain/Schemas/Recipe.schema";

export class PrismaRecipeRepository implements RecipeRepository {
  async findById(id: string): Promise<Recipe | null> {
    try {
      const recipeData = await prisma.recipe.findUnique({
        where: { id },
        include: {
          ingredients: {
            include: { product: true },
            orderBy: { order: "asc" }
          },
          steps: {
            orderBy: { stepNumber: "asc" }
          },
          ingredientGroups: {
            include: {
              ingredients: {
                include: { product: true },
                orderBy: { order: "asc" }
              }
            },
            orderBy: { order: "asc" }
          },
          stepGroups: {
            include: {
              steps: {
                orderBy: { stepNumber: "asc" }
              }
            },
            orderBy: { order: "asc" }
          }
        }
      });

      if (!recipeData) return null;

      return this.mapToDomain(recipeData);
    } catch (error) {
      throw new Error("Failed to find recipe by ID");
    }
  }

  async findManyByUserId(userId: string): Promise<Recipe[]> {
    try {
      const recipesData = await prisma.recipe.findMany({
        where: {
          OR: [{ userId }, { collaborators: { some: { userId } } }]
        },
        include: {
          ingredients: {
            include: { product: true },
            orderBy: { order: "asc" }
          },
          steps: {
            orderBy: { stepNumber: "asc" }
          },
          ingredientGroups: {
            include: {
              ingredients: {
                include: { product: true },
                orderBy: { order: "asc" }
              }
            },
            orderBy: { order: "asc" }
          },
          stepGroups: {
            include: {
              steps: {
                orderBy: { stepNumber: "asc" }
              }
            },
            orderBy: { order: "asc" }
          }
        },
        orderBy: { createdAt: "desc" }
      });

      return recipesData.map((recipeData) => this.mapToDomain(recipeData));
    } catch (error) {
      throw new Error("Failed to find recipes by user ID");
    }
  }

  async findManyPublic(): Promise<Recipe[]> {
    try {
      const recipesData = await prisma.recipe.findMany({
        where: { isPublic: true },
        include: {
          ingredients: {
            include: { product: true },
            orderBy: { order: "asc" }
          },
          steps: {
            orderBy: { stepNumber: "asc" }
          },
          ingredientGroups: {
            include: {
              ingredients: {
                include: { product: true },
                orderBy: { order: "asc" }
              }
            },
            orderBy: { order: "asc" }
          },
          stepGroups: {
            include: {
              steps: {
                orderBy: { stepNumber: "asc" }
              }
            },
            orderBy: { order: "asc" }
          }
        },
        orderBy: { createdAt: "desc" }
      });

      return recipesData.map((recipeData) => this.mapToDomain(recipeData));
    } catch (error) {
      throw new Error("Failed to find public recipes");
    }
  }

  async searchPublicRecipes(filters: any): Promise<Recipe[]> {
    try {
      const where: any = { isPublic: true };

      if (filters.searchTerm) {
        where.OR = [
          { name: { contains: filters.searchTerm, mode: "insensitive" } },
          { description: { contains: filters.searchTerm, mode: "insensitive" } }
        ];
      }

      if (filters.category) {
        where.category = filters.category;
      }

      if (filters.cuisine) {
        where.cuisine = filters.cuisine;
      }

      if (filters.difficulty) {
        where.difficulty = filters.difficulty;
      }

      let orderBy: any = { createdAt: "desc" };
      if (filters.sortBy === "popular") {
        orderBy = { viewsCount: "desc" };
      } else if (filters.sortBy === "favorites") {
        orderBy = { favoritesCount: "desc" };
      }

      const recipesData = await prisma.recipe.findMany({
        where,
        include: {
          ingredients: {
            include: { product: true },
            orderBy: { order: "asc" }
          },
          steps: {
            orderBy: { stepNumber: "asc" }
          },
          ingredientGroups: {
            include: {
              ingredients: {
                include: { product: true },
                orderBy: { order: "asc" }
              }
            },
            orderBy: { order: "asc" }
          },
          stepGroups: {
            include: {
              steps: {
                orderBy: { stepNumber: "asc" }
              }
            },
            orderBy: { order: "asc" }
          }
        },
        orderBy
      });

      return recipesData.map((recipeData) => this.mapToDomain(recipeData));
    } catch (error) {
      throw new Error("Failed to search public recipes");
    }
  }

  async save(recipe: Recipe): Promise<Recipe> {
    try {
      const existingRecipe = await prisma.recipe.findUnique({
        where: { id: recipe.id }
      });

      if (existingRecipe) {
        await prisma.$transaction(async (tx) => {
          await tx.ingredientGroup.deleteMany({
            where: { recipeId: recipe.id }
          });

          await tx.stepGroup.deleteMany({
            where: { recipeId: recipe.id }
          });

          await tx.recipeIngredient.deleteMany({
            where: { recipeId: recipe.id }
          });

          await tx.recipeStep.deleteMany({
            where: { recipeId: recipe.id }
          });

          await tx.recipe.update({
            where: { id: recipe.id },
            data: {
              name: recipe.name,
              description: recipe.description ?? null,
              difficulty: recipe.difficulty,
              preparationTime: recipe.preparationTime,
              cookingTime: recipe.cookingTime,
              servings: recipe.servings,
              imageUrl: recipe.imageUrl ?? null,
              category: recipe.toObject().category ?? null,
              cuisine: recipe.toObject().cuisine ?? null,
              isPublic: recipe.isPublic,
              updatedAt: new Date()
            }
          });

          const ingredientGroups = recipe.ingredientGroups || [];
          for (const group of ingredientGroups) {
            await tx.ingredientGroup.create({
              data: {
                id: group.id,
                recipeId: recipe.id,
                name: group.name,
                order: group.order
              }
            });
          }

          const stepGroups = recipe.stepGroups || [];
          for (const group of stepGroups) {
            await tx.stepGroup.create({
              data: {
                id: group.id,
                recipeId: recipe.id,
                name: group.name,
                order: group.order
              }
            });
          }

          if (recipe.ingredients.length > 0) {
            await tx.recipeIngredient.createMany({
              data: recipe.ingredients.map((ing) => ({
                id: ing.id,
                recipeId: recipe.id,
                productId: ing.productId,
                quantity: ing.quantity,
                unit: ing.unit,
                order: ing.order,
                groupId: ing.groupId ?? null
              }))
            });
          }

          if (recipe.steps.length > 0) {
            await tx.recipeStep.createMany({
              data: recipe.steps.map((step) => ({
                id: step.id,
                recipeId: recipe.id,
                stepNumber: step.stepNumber,
                description: step.description,
                duration: step.duration ?? null,
                groupId: step.groupId ?? null
              }))
            });
          }
        });
      } else {
        await prisma.$transaction(async (tx) => {
          await tx.recipe.create({
            data: {
              id: recipe.id,
              name: recipe.name,
              description: recipe.description ?? null,
              difficulty: recipe.difficulty,
              preparationTime: recipe.preparationTime,
              cookingTime: recipe.cookingTime,
              servings: recipe.servings,
              imageUrl: recipe.imageUrl ?? null,
              category: recipe.toObject().category ?? null,
              cuisine: recipe.toObject().cuisine ?? null,
              userId: recipe.userId,
              isPublic: recipe.isPublic,
              createdAt: recipe.createdAt,
              updatedAt: recipe.updatedAt
            }
          });

          const ingredientGroups = recipe.ingredientGroups || [];
          for (const group of ingredientGroups) {
            await tx.ingredientGroup.create({
              data: {
                id: group.id,
                recipeId: recipe.id,
                name: group.name,
                order: group.order
              }
            });
          }

          const stepGroups = recipe.stepGroups || [];
          for (const group of stepGroups) {
            await tx.stepGroup.create({
              data: {
                id: group.id,
                recipeId: recipe.id,
                name: group.name,
                order: group.order
              }
            });
          }

          if (recipe.ingredients.length > 0) {
            await tx.recipeIngredient.createMany({
              data: recipe.ingredients.map((ing) => ({
                id: ing.id,
                recipeId: recipe.id,
                productId: ing.productId,
                quantity: ing.quantity,
                unit: ing.unit,
                order: ing.order,
                groupId: ing.groupId ?? null
              }))
            });
          }

          if (recipe.steps.length > 0) {
            await tx.recipeStep.createMany({
              data: recipe.steps.map((step) => ({
                id: step.id,
                recipeId: recipe.id,
                stepNumber: step.stepNumber,
                description: step.description,
                duration: step.duration ?? null,
                groupId: step.groupId ?? null
              }))
            });
          }
        });
      }

      return this.findById(recipe.id) as Promise<Recipe>;
    } catch (error) {
      console.error("Error saving recipe:", error);
      throw new Error("Failed to save recipe", { cause: error });
    }
  }

  async remove(id: string): Promise<void> {
    try {
      await prisma.recipe.delete({
        where: { id }
      });
    } catch (error) {
      throw new Error("Failed to remove recipe");
    }
  }

  async findByShareToken(token: string): Promise<Recipe | null> {
    try {
      const recipeData = await prisma.recipe.findUnique({
        where: { shareToken: token },
        include: {
          ingredients: {
            include: { product: true },
            orderBy: { order: "asc" }
          },
          steps: {
            orderBy: { stepNumber: "asc" }
          },
          ingredientGroups: {
            include: {
              ingredients: {
                include: { product: true },
                orderBy: { order: "asc" }
              }
            },
            orderBy: { order: "asc" }
          },
          stepGroups: {
            include: {
              steps: {
                orderBy: { stepNumber: "asc" }
              }
            },
            orderBy: { order: "asc" }
          }
        }
      });

      if (!recipeData) return null;

      return this.mapToDomain(recipeData);
    } catch (error) {
      throw new Error("Failed to find recipe by share token");
    }
  }

  async findPublicRecipes(filters: RecipeSearchFilters): Promise<Recipe[]> {
    return this.searchPublicRecipes(filters);
  }

  async findTrendingPublicRecipes(limit = 12): Promise<RecipeTrendingData[]> {
    try {
      const trendingData = await prisma.recipeTrending.findMany({
        where: {
          recipe: { isPublic: true }
        },
        include: {
          recipe: {
            include: {
              ingredients: {
                include: { product: true },
                orderBy: { order: "asc" }
              },
              steps: {
                orderBy: { stepNumber: "asc" }
              }
            }
          }
        },
        orderBy: { score: "desc" },
        take: limit
      });

      return trendingData.map((item) => ({
        recipe: this.mapToDomain(item.recipe).toObject(),
        trendingScore: item.score,
        viewsLast7Days: item.viewsLast7Days,
        favoritesLast7Days: item.favoritesLast7Days
      }));
    } catch (error) {
      throw new Error("Failed to find trending public recipes");
    }
  }

  async findRecentPublicRecipes(limit = 12): Promise<Recipe[]> {
    try {
      const recipesData = await prisma.recipe.findMany({
        where: { isPublic: true },
        include: {
          ingredients: {
            include: { product: true },
            orderBy: { order: "asc" }
          },
          steps: {
            orderBy: { stepNumber: "asc" }
          },
          ingredientGroups: {
            include: {
              ingredients: {
                include: { product: true },
                orderBy: { order: "asc" }
              }
            },
            orderBy: { order: "asc" }
          },
          stepGroups: {
            include: {
              steps: {
                orderBy: { stepNumber: "asc" }
              }
            },
            orderBy: { order: "asc" }
          }
        },
        orderBy: { createdAt: "desc" },
        take: limit
      });

      return recipesData.map((recipeData) => this.mapToDomain(recipeData));
    } catch (error) {
      throw new Error("Failed to find recent public recipes");
    }
  }

  async findPublicRecipesByCategory(category: string, limit = 20): Promise<Recipe[]> {
    try {
      const recipesData = await prisma.recipe.findMany({
        where: {
          isPublic: true,
          category
        },
        include: {
          ingredients: {
            include: { product: true },
            orderBy: { order: "asc" }
          },
          steps: {
            orderBy: { stepNumber: "asc" }
          },
          ingredientGroups: {
            include: {
              ingredients: {
                include: { product: true },
                orderBy: { order: "asc" }
              }
            },
            orderBy: { order: "asc" }
          },
          stepGroups: {
            include: {
              steps: {
                orderBy: { stepNumber: "asc" }
              }
            },
            orderBy: { order: "asc" }
          }
        },
        orderBy: { createdAt: "desc" },
        take: limit
      });

      return recipesData.map((recipeData) => this.mapToDomain(recipeData));
    } catch (error) {
      throw new Error("Failed to find public recipes by category");
    }
  }

  async findPublicRecipesByCuisine(cuisine: string, limit = 20): Promise<Recipe[]> {
    try {
      const recipesData = await prisma.recipe.findMany({
        where: {
          isPublic: true,
          cuisine
        },
        include: {
          ingredients: {
            include: { product: true },
            orderBy: { order: "asc" }
          },
          steps: {
            orderBy: { stepNumber: "asc" }
          },
          ingredientGroups: {
            include: {
              ingredients: {
                include: { product: true },
                orderBy: { order: "asc" }
              }
            },
            orderBy: { order: "asc" }
          },
          stepGroups: {
            include: {
              steps: {
                orderBy: { stepNumber: "asc" }
              }
            },
            orderBy: { order: "asc" }
          }
        },
        orderBy: { createdAt: "desc" },
        take: limit
      });

      return recipesData.map((recipeData) => this.mapToDomain(recipeData));
    } catch (error) {
      throw new Error("Failed to find public recipes by cuisine");
    }
  }

  async findPublicRecipesByTag(tag: string, limit = 20): Promise<Recipe[]> {
    try {
      const recipesData = await prisma.recipe.findMany({
        where: {
          isPublic: true,
          tags: {
            has: tag
          }
        },
        include: {
          ingredients: {
            include: { product: true },
            orderBy: { order: "asc" }
          },
          steps: {
            orderBy: { stepNumber: "asc" }
          },
          ingredientGroups: {
            include: {
              ingredients: {
                include: { product: true },
                orderBy: { order: "asc" }
              }
            },
            orderBy: { order: "asc" }
          },
          stepGroups: {
            include: {
              steps: {
                orderBy: { stepNumber: "asc" }
              }
            },
            orderBy: { order: "asc" }
          }
        },
        orderBy: { createdAt: "desc" },
        take: limit
      });

      return recipesData.map((recipeData) => this.mapToDomain(recipeData));
    } catch (error) {
      throw new Error("Failed to find public recipes by tag");
    }
  }

  async checkUserAccess(
    recipeId: string,
    context: RecipeAccessContext
  ): Promise<{
    hasAccess: boolean;
    recipe: Recipe | null;
    reason?: "public" | "owner" | "collaborator" | "share_token" | "private" | "not_found";
  }> {
    try {
      const recipeData = await prisma.recipe.findUnique({
        where: { id: recipeId },
        include: {
          ingredients: {
            include: { product: true },
            orderBy: { order: "asc" }
          },
          steps: {
            orderBy: { stepNumber: "asc" }
          },
          ingredientGroups: {
            include: {
              ingredients: {
                include: { product: true },
                orderBy: { order: "asc" }
              }
            },
            orderBy: { order: "asc" }
          },
          stepGroups: {
            include: {
              steps: {
                orderBy: { stepNumber: "asc" }
              }
            },
            orderBy: { order: "asc" }
          },
          collaborators: true
        }
      });

      if (!recipeData) {
        return {
          hasAccess: false,
          recipe: null,
          reason: "not_found"
        };
      }

      const recipe = this.mapToDomain(recipeData);

      if (recipeData.isPublic) {
        return {
          hasAccess: true,
          recipe,
          reason: "public"
        };
      }

      if (context.userId) {
        if (recipeData.userId === context.userId) {
          return {
            hasAccess: true,
            recipe,
            reason: "owner"
          };
        }

        const isCollaborator = recipeData.collaborators.some((collab) => collab.userId === context.userId);

        if (isCollaborator) {
          return {
            hasAccess: true,
            recipe,
            reason: "collaborator"
          };
        }
      }

      if (context.shareToken && recipeData.shareToken === context.shareToken) {
        return {
          hasAccess: true,
          recipe,
          reason: "share_token"
        };
      }

      return {
        hasAccess: false,
        recipe,
        reason: "private"
      };
    } catch (error) {
      console.error("Error in checkUserAccess:", error);
      throw new Error("Failed to check user access", { cause: error });
    }
  }

  async incrementViews(recipeId: string): Promise<void> {
    try {
      await prisma.recipe.update({
        where: { id: recipeId },
        data: {
          viewsCount: {
            increment: 1
          }
        }
      });
    } catch (error) {
      throw new Error("Failed to increment views");
    }
  }

  async countPublicRecipes(): Promise<number> {
    try {
      return await prisma.recipe.count({
        where: { isPublic: true }
      });
    } catch (error) {
      throw new Error("Failed to count public recipes");
    }
  }

  async getPublicCategories(): Promise<Array<{ category: string; count: number }>> {
    try {
      const categories = await prisma.recipe.groupBy({
        by: ["category"],
        where: {
          isPublic: true,
          category: {
            not: null
          }
        },
        _count: true
      });

      return categories.map((cat) => ({
        category: cat.category as string,
        count: cat._count
      }));
    } catch (error) {
      throw new Error("Failed to get public categories");
    }
  }

  async getPublicCuisines(): Promise<Array<{ cuisine: string; count: number }>> {
    try {
      const cuisines = await prisma.recipe.groupBy({
        by: ["cuisine"],
        where: {
          isPublic: true,
          cuisine: {
            not: null
          }
        },
        _count: true
      });

      return cuisines.map((cui) => ({
        cuisine: cui.cuisine as string,
        count: cui._count
      }));
    } catch (error) {
      throw new Error("Failed to get public cuisines");
    }
  }

  async getPopularTags(limit = 20): Promise<Array<{ tag: string; count: number }>> {
    try {
      const recipes = await prisma.recipe.findMany({
        where: {
          isPublic: true,
          tags: {
            isEmpty: false
          }
        },
        select: {
          tags: true
        }
      });

      const tagCounts = new Map<string, number>();

      for (const recipe of recipes) {
        for (const tag of recipe.tags) {
          tagCounts.set(tag, (tagCounts.get(tag) || 0) + 1);
        }
      }

      return Array.from(tagCounts.entries())
        .map(([tag, count]) => ({ tag, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, limit);
    } catch (error) {
      throw new Error("Failed to get popular tags");
    }
  }

  public mapToDomain(recipeData: any): Recipe {
    const ingredients = (recipeData.ingredients || []).map((ing: any) =>
      RecipeIngredient.create(
        {
          recipeId: recipeData.id,
          productId: ing.productId,
          productName: ing.product?.name,
          quantity: ing.quantity,
          unit: ing.unit,
          order: ing.order,
          groupId: ing.groupId ?? undefined
        },
        ing.id
      )
    );

    const steps = (recipeData.steps || []).map((step: any) =>
      RecipeStep.create(
        {
          recipeId: recipeData.id,
          stepNumber: step.stepNumber,
          description: step.description,
          duration: step.duration ?? undefined,
          groupId: step.groupId ?? undefined
        },
        step.id
      )
    );

    const ingredientGroups = (recipeData.ingredientGroups || []).map((group: any) => {
      const groupIngredients = (group.ingredients || []).map((ing: any) =>
        RecipeIngredient.create(
          {
            recipeId: recipeData.id,
            productId: ing.productId,
            productName: ing.product?.name,
            quantity: ing.quantity,
            unit: ing.unit,
            order: ing.order,
            groupId: group.id
          },
          ing.id
        )
      );

      return IngredientGroup.create(
        {
          recipeId: recipeData.id,
          name: group.name,
          order: group.order,
          ingredients: groupIngredients
        },
        group.id
      );
    });

    const stepGroups = (recipeData.stepGroups || []).map((group: any) => {
      const groupSteps = (group.steps || []).map((step: any) =>
        RecipeStep.create(
          {
            recipeId: recipeData.id,
            stepNumber: step.stepNumber,
            description: step.description,
            duration: step.duration ?? undefined,
            groupId: group.id
          },
          step.id
        )
      );

      return StepGroup.create(
        {
          recipeId: recipeData.id,
          name: group.name,
          order: group.order,
          steps: groupSteps
        },
        group.id
      );
    });

    return Recipe.create(
      {
        name: recipeData.name,
        description: recipeData.description ?? undefined,
        difficulty: recipeData.difficulty as DifficultyLevel,
        preparationTime: recipeData.preparationTime,
        cookingTime: recipeData.cookingTime,
        servings: recipeData.servings,
        imageUrl: recipeData.imageUrl ?? undefined,
        category: recipeData.category ?? undefined,
        cuisine: recipeData.cuisine ?? undefined,
        viewsCount: recipeData.viewsCount ?? 0,
        favoritesCount: recipeData.favoritesCount ?? 0,
        userId: recipeData.userId,
        isPublic: recipeData.isPublic,
        ingredients,
        steps,
        ingredientGroups,
        stepGroups,
        estimatedQualityScore: recipeData.estimatedQualityScore ?? undefined
      },
      recipeData.id
    );
  }
}
