"use server";

import { auth } from "@deazl/system";
import { z } from "zod";
import { PrismaShoppingListRepository } from "../../../Infrastructure/Repositories/PrismaShoppingList.infrastructure";
import { PrismaShoppingListSharingRepository } from "../../../Infrastructure/Repositories/PrismaShoppingListSharing.infrastructure";

const UpdatePublicStatusSchema = z.object({
  listId: z.string().uuid(),
  isPublic: z.boolean()
});

type UpdatePublicStatusPayload = z.infer<typeof UpdatePublicStatusSchema>;

export async function updatePublicStatus(params: UpdatePublicStatusPayload): Promise<void> {
  try {
    const payload = UpdatePublicStatusSchema.parse(params);
    const session = await auth();

    if (!session?.user?.id) {
      throw new Error("User not authenticated");
    }

    // Check if user owns the list
    const listRepository = new PrismaShoppingListRepository();
    const list = await listRepository.findById(payload.listId);

    if (!list) {
      throw new Error("Shopping list not found");
    }

    if (list.userId !== session.user.id) {
      throw new Error("Unauthorized - only owner can change public status");
    }

    const sharingRepository = new PrismaShoppingListSharingRepository();
    await sharingRepository.updatePublicStatus(payload.listId, payload.isPublic);

    // Generate or revoke share token based on public status
    if (payload.isPublic) {
      await sharingRepository.generateShareToken(payload.listId);
    }
  } catch (error) {
    throw new Error("Failed to update public status", { cause: error });
  }
}
