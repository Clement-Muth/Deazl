import { z } from "zod";

export const AddCollaboratorSchema = z.object({
  shoppingListId: z.string().uuid(),
  email: z.string().email(),
  role: z.enum(["EDITOR", "VIEWER"])
});
export type AddCollaboratorPayload = z.infer<typeof AddCollaboratorSchema>;

export const GenerateShareLinkSchema = z.string().uuid();
export type GenerateShareLinkPayload = z.infer<typeof GenerateShareLinkSchema>;

export const GetCollaboratorsSchema = z.string().uuid();
export type GetCollaboratorsPayload = z.infer<typeof GetCollaboratorsSchema>;

export const RemoveCollaboratorSchema = z.object({
  listId: z.string().uuid(),
  userId: z.string().uuid()
});
export type RemoveCollaboratorPayload = z.infer<typeof RemoveCollaboratorSchema>;
