"use server";

import { z } from "zod";
import { ShoppingListSharingApplicationService } from "../../../Application/Services/ShoppingListSharing.service";
import { PrismaShoppingListRepository } from "../../../Infrastructure/Repositories/PrismaShoppingList.infrastructure";
import { PrismaShoppingListSharingRepository } from "../../../Infrastructure/Repositories/PrismaShoppingListSharing.infrastructure";

const UpdateCollaboratorRoleSchema = z.object({
  listId: z.string().uuid(),
  userId: z.string().uuid(),
  role: z.enum(["EDITOR", "VIEWER"])
});

type UpdateCollaboratorRolePayload = z.infer<typeof UpdateCollaboratorRoleSchema>;

const shoppingListSharingService = new ShoppingListSharingApplicationService(
  new PrismaShoppingListRepository(),
  new PrismaShoppingListSharingRepository()
);

export async function updateCollaboratorRole(params: UpdateCollaboratorRolePayload): Promise<void> {
  try {
    const payload = UpdateCollaboratorRoleSchema.parse(params);

    const repository = new PrismaShoppingListSharingRepository();
    await repository.updateCollaboratorRole(payload.listId, payload.userId, payload.role as any);
  } catch (error) {
    throw new Error("Failed to update collaborator role", { cause: error });
  }
}
