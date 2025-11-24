import { z } from "zod";

export const DifficultyLevelEnum = z.enum(["EASY", "MEDIUM", "HARD"]);
export type DifficultyLevel = z.infer<typeof DifficultyLevelEnum>;

export const RecipeIngredientSchema = z.object({
  id: z.string().uuid(),
  productId: z.string().uuid(),
  productName: z.string().optional(),
  quantity: z.number().positive(),
  unit: z.string(),
  order: z.number().int().default(0),
  groupId: z.string().uuid().optional()
});

export const RecipeStepSchema = z.object({
  id: z.string().uuid(),
  stepNumber: z.number().int().positive(),
  description: z.string().min(1),
  duration: z.number().int().positive().nullable().optional(),
  groupId: z.string().uuid().optional()
});

export const IngredientGroupSchema = z.object({
  id: z.string().uuid().optional(),
  name: z.string().min(1),
  order: z.number().int().default(0),
  ingredients: z.array(
    z.object({
      productId: z.string().uuid(),
      productName: z.string().optional(),
      quantity: z.number().positive(),
      unit: z.string(),
      order: z.number().int().default(0)
    })
  )
});

export const StepGroupSchema = z.object({
  id: z.string().uuid().optional(),
  name: z.string().min(1),
  order: z.number().int().default(0),
  steps: z.array(
    z.object({
      stepNumber: z.number().int().positive(),
      description: z.string().min(1),
      duration: z.number().int().positive().nullable().optional()
    })
  )
});

export const RecipeSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1),
  description: z.string().nullable().optional(),
  difficulty: DifficultyLevelEnum,
  preparationTime: z.number().int().positive(),
  cookingTime: z.number().int().positive(),
  servings: z.number().int().positive().default(4),
  imageUrl: z.string().url().nullable().optional(),
  userId: z.string(),
  isPublic: z.boolean().default(false),
  category: z.string().nullable().optional(),
  cuisine: z.string().nullable().optional(),
  tags: z.array(z.string()).optional(),
  viewsCount: z.number().int().default(0),
  favoritesCount: z.number().int().default(0),
  ingredientGroups: z.array(IngredientGroupSchema).optional(),
  stepGroups: z.array(StepGroupSchema).optional(),
  ingredients: z.array(RecipeIngredientSchema).optional(),
  steps: z.array(RecipeStepSchema).optional(),
  createdAt: z.date().optional(),
  updatedAt: z.date().optional(),
  estimatedQualityScore: z.number().int().optional()
});

export const CreateRecipeSchema = z
  .object({
    name: z.string().min(1, "Le nom de la recette est requis"),
    description: z.string().optional(),
    difficulty: DifficultyLevelEnum.default("EASY"),
    preparationTime: z
      .number()
      .int()
      .positive({ message: "Le temps de préparation doit être supérieur à 0" }),
    cookingTime: z.number().int().positive({ message: "Le temps de cuisson doit être supérieur à 0" }),
    servings: z.number().int().positive().default(4),
    imageUrl: z.string().url().nullable().optional(),
    category: z.string().optional(),
    cuisine: z.string().optional(),
    isPublic: z.boolean().default(true),
    ingredientGroups: z.array(IngredientGroupSchema).optional(),
    ingredients: z
      .array(
        z.object({
          productId: z.string().uuid("Product is required"),
          productName: z.string().optional(),
          quantity: z.number().positive(),
          unit: z.string(),
          order: z.number().int().default(0),
          groupId: z.string().uuid().optional()
        })
      )
      .optional(),
    stepGroups: z.array(StepGroupSchema).optional(),
    steps: z
      .array(
        z.object({
          stepNumber: z.number().int().positive(),
          description: z.string().min(1),
          duration: z.number().int().positive().nullable().optional(),
          groupId: z.string().uuid().optional()
        })
      )
      .optional()
      .default([])
  })
  .refine(
    (data) => {
      const hasIngredients = data.ingredients && data.ingredients.length > 0;
      const hasIngredientGroups = data.ingredientGroups && data.ingredientGroups.length > 0;
      return hasIngredients || hasIngredientGroups;
    },
    { message: "At least one ingredient or ingredient group is required" }
  )
  .refine(
    (data) => {
      const hasSteps =
        data.steps && data.steps.length > 0 && data.steps.every((s) => s.description.length > 0);
      const hasStepGroups = data.stepGroups && data.stepGroups.length > 0;
      return hasSteps || hasStepGroups;
    },
    { message: "At least one step or step group is required" }
  );

export type CreateRecipePayload = z.infer<typeof CreateRecipeSchema>;

export const UpdateRecipeSchema = z.object({
  name: z.string().min(1).optional(),
  description: z.string().nullable().optional(),
  difficulty: DifficultyLevelEnum.optional(),
  preparationTime: z.number().int().positive().optional(),
  cookingTime: z.number().int().positive().optional(),
  servings: z.number().int().positive().optional(),
  imageUrl: z.string().url().nullable().optional(),
  category: z.string().nullable().optional(),
  cuisine: z.string().nullable().optional(),
  isPublic: z.boolean().optional(),
  ingredientGroups: z.array(IngredientGroupSchema).optional(),
  ingredients: z
    .array(
      z.object({
        productId: z.string().uuid(),
        productName: z.string().optional(),
        quantity: z.number().positive(),
        unit: z.string(),
        order: z.number().int().default(0),
        groupId: z.string().uuid().optional()
      })
    )
    .optional(),
  stepGroups: z.array(StepGroupSchema).optional(),
  steps: z
    .array(
      z.object({
        stepNumber: z.number().int().positive(),
        description: z.string().min(1),
        duration: z.number().int().positive().nullable().optional(),
        groupId: z.string().uuid().optional()
      })
    )
    .optional()
});

export type UpdateRecipePayload = z.infer<typeof UpdateRecipeSchema>;

export const DeleteRecipeSchema = z.string().uuid();
export type DeleteRecipePayload = z.infer<typeof DeleteRecipeSchema>;

export const GetRecipeSchema = z.string().uuid();
export type GetRecipePayload = z.infer<typeof GetRecipeSchema>;

export type RecipePayload = z.infer<typeof RecipeSchema> & {
  totalTime: number;
};
