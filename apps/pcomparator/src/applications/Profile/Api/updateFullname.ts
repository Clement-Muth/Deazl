"use server";

import { z } from "zod";
import { ProfileApplicationService } from "~/applications/Profile/Application/Services/ProfileApplicationService";
import { PrismaProfileRepository } from "~/applications/Profile/Infrastructure/PrismaUserRepository";
import { auth } from "~/libraries/nextauth/authConfig";

const ParamsSchema = z.object({
  name: z.string().min(1).max(32)
});

export type UpdateFullnameParams = z.infer<typeof ParamsSchema>;

/**
 * Updates the authenticated user's full name.
 *
 * @async
 * @function updateFullname
 * @param {z.infer<typeof ParamsSchema>} params - The parameters containing the new name to update in the user profile.
 * @throws {Error} Throws an error if the user is not authenticated.
 * @throws {Error} Throws an error if the user is not found.
 * @returns {Promise<void>} Resolves when the name has been successfully updated.
 */
export const updateFullname = async (params: z.infer<typeof ParamsSchema>): Promise<void> => {
  const paramsPayload = ParamsSchema.parse(params);
  const session = await auth();

  if (!session?.user?.id) throw new Error("User not authenticated");

  const profileService = new ProfileApplicationService(new PrismaProfileRepository());

  await profileService.updateProfile({
    id: session.user.id,
    name: paramsPayload.name
  });
};
