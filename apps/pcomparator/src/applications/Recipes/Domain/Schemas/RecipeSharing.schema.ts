import { z } from "zod";

export const RecipeCollaboratorSchema = z.object({
  id: z.string().uuid(),
  recipeId: z.string().uuid(),
  userId: z.string(),
  role: z.enum(["OWNER", "EDITOR", "VIEWER"]),
  user: z
    .object({
      id: z.string(),
      name: z.string().nullable(),
      email: z.string(),
      image: z.string().nullable()
    })
    .nullable()
});

export const AddCollaboratorSchema = z.object({
  recipeId: z.string().uuid(),
  email: z.string().email(),
  role: z.enum(["EDITOR", "VIEWER"])
});
export type AddCollaboratorPayload = z.infer<typeof AddCollaboratorSchema>;

export const GenerateShareLinkSchema = z.string().uuid();
export type GenerateShareLinkPayload = z.infer<typeof GenerateShareLinkSchema>;

export const GetCollaboratorsSchema = z.string().uuid();
export type GetCollaboratorsPayload = z.infer<typeof GetCollaboratorsSchema>;

export const RemoveCollaboratorSchema = z.object({
  recipeId: z.string().uuid(),
  userId: z.string().uuid()
});
export type RemoveCollaboratorPayload = z.infer<typeof RemoveCollaboratorSchema>;

export const GetRecipeByShareTokenSchema = z.string().min(1);
export type GetRecipeByShareTokenPayload = z.infer<typeof GetRecipeByShareTokenSchema>;
