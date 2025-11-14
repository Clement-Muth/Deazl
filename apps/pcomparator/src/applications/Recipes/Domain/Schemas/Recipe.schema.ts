import { z } from "zod";

export const DifficultyLevelEnum = z.enum(["EASY", "MEDIUM", "HARD"]);
export type DifficultyLevel = z.infer<typeof DifficultyLevelEnum>;

export const RecipeIngredientSchema = z.object({
  id: z.string().uuid(),
  productId: z.string().uuid(),
  productName: z.string().optional(),
  quantity: z.number().positive(),
  unit: z.string(),
  order: z.number().int().default(0)
});

export const RecipeStepSchema = z.object({
  id: z.string().uuid(),
  stepNumber: z.number().int().positive(),
  description: z.string().min(1),
  duration: z.number().int().positive().nullable().optional()
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
  ingredients: z.array(RecipeIngredientSchema).optional(),
  steps: z.array(RecipeStepSchema).optional(),
  createdAt: z.date().optional(),
  updatedAt: z.date().optional(),
  estimatedQualityScore: z.number().int().optional()
});

export const CreateRecipeSchema = z.object({
  name: z.string().min(1, "Le nom de la recette est requis"),
  description: z.string().optional(),
  difficulty: DifficultyLevelEnum.default("EASY"),
  preparationTime: z.number().int().positive({ message: "Le temps de préparation doit être supérieur à 0" }),
  cookingTime: z.number().int().positive({ message: "Le temps de cuisson doit être supérieur à 0" }),
  servings: z.number().int().positive().default(4),
  imageUrl: z.string().url().nullable().optional(),
  isPublic: z.boolean().default(false),
  ingredients: z
    .array(
      z.object({
        productId: z.string().uuid("Product is required"),
        productName: z.string().optional(),
        quantity: z.number().positive(),
        unit: z.string(),
        order: z.number().int().default(0)
      })
    )
    .min(1, "At least one ingredient is required"),
  steps: z.array(
    z.object({
      stepNumber: z.number().int().positive(),
      description: z.string().min(1),
      duration: z.number().int().positive().nullable().optional()
    })
  )
});

export type CreateRecipePayload = z.infer<typeof CreateRecipeSchema>;

export const UpdateRecipeSchema = z.object({
  name: z.string().min(1).optional(),
  description: z.string().nullable().optional(),
  difficulty: DifficultyLevelEnum.optional(),
  preparationTime: z.number().int().positive().optional(),
  cookingTime: z.number().int().positive().optional(),
  servings: z.number().int().positive().optional(),
  imageUrl: z.string().url().nullable().optional(),
  isPublic: z.boolean().optional(),
  ingredients: z
    .array(
      z.object({
        productId: z.string().uuid(),
        productName: z.string().optional(),
        quantity: z.number().positive(),
        unit: z.string(),
        order: z.number().int().default(0)
      })
    )
    .optional(),
  steps: z
    .array(
      z.object({
        stepNumber: z.number().int().positive(),
        description: z.string().min(1),
        duration: z.number().int().positive().nullable().optional()
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
