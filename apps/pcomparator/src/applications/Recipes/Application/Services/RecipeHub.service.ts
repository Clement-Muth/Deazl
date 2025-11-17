import type { Recipe } from "../../Domain/Entities/Recipe.entity";
import { RecipeCellarService } from "./RecipeCellar.service";
import { RecipePricingService } from "./RecipePricing.service";
import { RecipeQualityService } from "./RecipeQuality.service";
import { RecipeRecommendationService } from "./RecipeRecommendation.service";
import { RecipeSearchService } from "./RecipeSearch.service";

export interface RecipeHubData {
  popular: Recipe[];
  quick: Recipe[];
  cheap: Recipe[];
  healthy: Recipe[];
  cellarBased: Recipe[];
  recommended: Recipe[];
  purchaseBased: Recipe[];
  new: Recipe[];
  categories: RecipeCategoryData[];
}

export interface RecipeCategoryData {
  name: string;
  slug: string;
  count: number;
  recipes: Recipe[];
}

export class RecipeHubService {
  private searchService: RecipeSearchService;
  private pricingService: RecipePricingService;
  private qualityService: RecipeQualityService;
  private cellarService: RecipeCellarService;
  private recommendationService: RecipeRecommendationService;

  constructor() {
    this.searchService = new RecipeSearchService();
    this.pricingService = new RecipePricingService();
    this.qualityService = new RecipeQualityService();
    this.cellarService = new RecipeCellarService();
    this.recommendationService = new RecipeRecommendationService();
  }

  async getHubData(userId?: string): Promise<RecipeHubData> {
    const [popular, quick, cheap, healthy, newRecipes] = await Promise.all([
      this.searchService.getPopularRecipes(10),
      this.searchService.getQuickRecipes(30, 10),
      this.pricingService.getCheapRecipes(10),
      this.qualityService.getHealthyRecipes(10, 70),
      this.searchService.getNewRecipes(10)
    ]);

    let cellarBased: Recipe[] = [];
    let recommended: Recipe[] = [];
    let purchaseBased: Recipe[] = [];

    if (userId) {
      [cellarBased, recommended, purchaseBased] = await Promise.all([
        this.cellarService.getRecipesFeasibleWithCellar(userId, 10),
        this.recommendationService.getRecommendedRecipes(userId, 10),
        this.recommendationService.getRecipesBasedOnPurchases(userId, 10)
      ]);
    }

    const categories = await this.getPopularCategories();

    return {
      popular,
      quick,
      cheap,
      healthy,
      cellarBased,
      recommended,
      purchaseBased,
      new: newRecipes,
      categories
    };
  }

  async getPopularCategories(): Promise<RecipeCategoryData[]> {
    const categories = ["Appetizer", "Main Course", "Dessert", "Snack", "Breakfast"];

    const categoryData = await Promise.all(
      categories.map(async (category) => {
        const recipes = await this.searchService.getRecipesByCategory(category, 6);
        return {
          name: category,
          slug: category.toLowerCase().replace(/\s+/g, "-"),
          count: recipes.length,
          recipes
        };
      })
    );

    return categoryData.filter((cat) => cat.count > 0);
  }

  getSearchService(): RecipeSearchService {
    return this.searchService;
  }

  getPricingService(): RecipePricingService {
    return this.pricingService;
  }

  getQualityService(): RecipeQualityService {
    return this.qualityService;
  }

  getCellarService(): RecipeCellarService {
    return this.cellarService;
  }

  getRecommendationService(): RecipeRecommendationService {
    return this.recommendationService;
  }
}
