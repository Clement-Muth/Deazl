import type {
  RecipeRepository,
  RecipeSearchFilters,
  RecipeTrendingData
} from "~/applications/Recipes/Domain/Repositories/RecipeRepository";
import type { RecipePayload } from "~/applications/Recipes/Domain/Schemas/Recipe.schema";

export interface PublicHubSection<T = RecipePayload> {
  title: string;
  items: T[];
  count: number;
}

export interface PublicRecipeHubData {
  trending: PublicHubSection<RecipeTrendingData>;
  recent: PublicHubSection<RecipePayload>;
  categories: Array<{ category: string; count: number }>;
  cuisines: Array<{ cuisine: string; count: number }>;
  popularTags: Array<{ tag: string; count: number }>;
  totalRecipes: number;
}

export interface SearchResults {
  recipes: RecipePayload[];
  total: number;
  filters: RecipeSearchFilters;
}

export class PublicRecipeHubApplicationService {
  constructor(private readonly recipeRepository: RecipeRepository) {}

  public async getPublicHubData(options?: {
    trendingLimit?: number;
    recentLimit?: number;
    tagsLimit?: number;
  }): Promise<PublicRecipeHubData> {
    const trendingLimit = options?.trendingLimit ?? 12;
    const recentLimit = options?.recentLimit ?? 12;
    const tagsLimit = options?.tagsLimit ?? 20;

    const [trending, recent, categories, cuisines, popularTags, totalRecipes] = await Promise.all([
      this.recipeRepository.findTrendingPublicRecipes(trendingLimit),
      this.recipeRepository.findRecentPublicRecipes(recentLimit),
      this.recipeRepository.getPublicCategories(),
      this.recipeRepository.getPublicCuisines(),
      this.recipeRepository.getPopularTags(tagsLimit),
      this.recipeRepository.countPublicRecipes()
    ]);

    return {
      trending: {
        title: "Tendances",
        items: trending,
        count: trending.length
      },
      recent: {
        title: "Nouvelles recettes",
        items: recent.map((recipe) => recipe.toObject()),
        count: recent.length
      },
      categories: categories.sort((a, b) => b.count - a.count).slice(0, 12),
      cuisines: cuisines.sort((a, b) => b.count - a.count).slice(0, 12),
      popularTags: popularTags.sort((a, b) => b.count - a.count),
      totalRecipes
    };
  }

  public async getTrendingRecipes(limit = 12): Promise<RecipeTrendingData[]> {
    return await this.recipeRepository.findTrendingPublicRecipes(limit);
  }

  public async getRecentRecipes(limit = 12): Promise<RecipePayload[]> {
    const recipes = await this.recipeRepository.findRecentPublicRecipes(limit);
    return recipes.map((recipe) => recipe.toObject());
  }

  public async getRecipesByCategory(category: string, limit = 20): Promise<RecipePayload[]> {
    const recipes = await this.recipeRepository.findPublicRecipesByCategory(category, limit);
    return recipes.map((recipe) => recipe.toObject());
  }

  public async getRecipesByCuisine(cuisine: string, limit = 20): Promise<RecipePayload[]> {
    const recipes = await this.recipeRepository.findPublicRecipesByCuisine(cuisine, limit);
    return recipes.map((recipe) => recipe.toObject());
  }

  public async getRecipesByTag(tag: string, limit = 20): Promise<RecipePayload[]> {
    const recipes = await this.recipeRepository.findPublicRecipesByTag(tag, limit);
    return recipes.map((recipe) => recipe.toObject());
  }

  public async searchPublicRecipes(filters: RecipeSearchFilters): Promise<SearchResults> {
    const recipes = await this.recipeRepository.searchPublicRecipes(filters);

    return {
      recipes: recipes.map((recipe) => recipe.toObject()),
      total: recipes.length,
      filters
    };
  }

  public async getPublicCategories(): Promise<Array<{ category: string; count: number }>> {
    return await this.recipeRepository.getPublicCategories();
  }

  public async getPublicCuisines(): Promise<Array<{ cuisine: string; count: number }>> {
    return await this.recipeRepository.getPublicCuisines();
  }

  public async getPopularTags(limit = 20): Promise<Array<{ tag: string; count: number }>> {
    return await this.recipeRepository.getPopularTags(limit);
  }
}
