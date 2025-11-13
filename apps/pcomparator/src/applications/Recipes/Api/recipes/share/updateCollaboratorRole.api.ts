"use server";

import { z } from "zod";
import { PrismaRecipeSharingRepository } from "../../../Infrastructure/Repositories/PrismaRecipeSharingRepository";

const UpdateCollaboratorRoleSchema = z.object({
  recipeId: z.string().uuid(),
  userId: z.string().uuid(),
  role: z.enum(["EDITOR", "VIEWER"])
});

type UpdateCollaboratorRolePayload = z.infer<typeof UpdateCollaboratorRoleSchema>;

export async function updateCollaboratorRole(params: UpdateCollaboratorRolePayload): Promise<void> {
  try {
    const payload = UpdateCollaboratorRoleSchema.parse(params);

    const repository = new PrismaRecipeSharingRepository();
    await repository.updateCollaboratorRole(payload.recipeId, payload.userId, payload.role as any);
  } catch (error) {
    throw new Error("Failed to update collaborator role", { cause: error });
  }
}
