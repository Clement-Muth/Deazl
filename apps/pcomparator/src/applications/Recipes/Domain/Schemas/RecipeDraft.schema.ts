import { z } from "zod";
import { DifficultyLevelEnum } from "./Recipe.schema";

export const IngredientDraftSchema = z.object({
  productId: z.string().uuid().optional(),
  productName: z.string().min(1),
  quantity: z.number().positive(),
  unit: z.string(),
  order: z.number().int().default(0),
  alternatives: z
    .array(
      z.object({
        productId: z.string().uuid(),
        productName: z.string(),
        reason: z.string(),
        priceDifference: z.number(),
        qualityImprovement: z.number().optional()
      })
    )
    .optional(),
  price: z.number().optional(),
  novaScore: z.number().int().min(1).max(4).optional(),
  isManualEntry: z.boolean().default(false)
});

export const StepDraftSchema = z.object({
  stepNumber: z.number().int().positive(),
  description: z.string().min(1),
  duration: z.number().int().positive().nullable().optional(),
  tips: z.array(z.string()).optional()
});

export const NutritionSummarySchema = z.object({
  calories: z.number().optional(),
  protein: z.number().optional(),
  carbs: z.number().optional(),
  fat: z.number().optional(),
  fiber: z.number().optional(),
  sugar: z.number().optional()
});

export const RecipeDraftSchema = z.object({
  id: z.string().uuid().optional(),
  name: z.string().min(1),
  description: z.string().optional(),
  subtitle: z.string().optional(),
  difficulty: DifficultyLevelEnum.default("EASY"),
  preparationTime: z.number().int().positive(),
  cookingTime: z.number().int().positive(),
  servings: z.number().int().positive().default(4),
  imageUrl: z.string().url().nullable().optional(),
  imageFile: z.any().optional(),
  ingredients: z.array(IngredientDraftSchema).min(1),
  steps: z.array(StepDraftSchema).min(1),
  source: z.enum(["photo", "url", "ai", "manual"]),
  sourceUrl: z.string().url().optional(),
  totalPrice: z.number().optional(),
  pricePerServing: z.number().optional(),
  qualityScore: z.number().int().min(0).max(100).optional(),
  nutritionSummary: NutritionSummarySchema.optional(),
  tags: z.array(z.string()).optional(),
  dietaryRestrictions: z.array(z.string()).optional(),
  createdAt: z.date().default(() => new Date()),
  lastModified: z.date().default(() => new Date())
});

export const RecipeConstraintsSchema = z.object({
  maxBudget: z.number().positive().optional(),
  maxCalories: z.number().positive().optional(),
  maxTime: z.number().int().positive().optional(),
  difficulty: DifficultyLevelEnum.optional(),
  dietaryRestrictions: z.array(z.string()).optional(),
  avoidIngredients: z.array(z.string()).optional(),
  preferredIngredients: z.array(z.string()).optional(),
  servings: z.number().int().positive().default(4)
});

export type IngredientDraft = z.infer<typeof IngredientDraftSchema>;
export type StepDraft = z.infer<typeof StepDraftSchema>;
export type NutritionSummary = z.infer<typeof NutritionSummarySchema>;
export type RecipeDraft = z.infer<typeof RecipeDraftSchema>;
export type RecipeConstraints = z.infer<typeof RecipeConstraintsSchema>;

export type RecipeBuilderMode = "photo" | "url" | "ai" | "manual";

export interface RecipeBuilderState {
  mode: RecipeBuilderMode;
  draft: Partial<RecipeDraft>;
  isLoading: boolean;
  error: string | null;
  step: number;
}
