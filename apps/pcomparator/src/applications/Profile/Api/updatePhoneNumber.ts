"use server";

import { z } from "zod";
import { ProfileApplicationService } from "~/applications/Profile/Application/Services/ProfileApplicationService";
import { PrismaProfileRepository } from "~/applications/Profile/Infrastructure/PrismaUserRepository";
import { auth } from "~/libraries/nextauth/authConfig";

const ParamsSchema = z.object({
  phone: z.string().optional()
});

export type UpdatePhoneParams = z.infer<typeof ParamsSchema>;

/**
 * Updates the authenticated user's phone number.
 *
 * @async
 * @function updatePhoneNumber
 * @param {UpdatePhoneParams} params - The parameters containing the new phone number to update in the user profile.
 * @throws {Error} Throws an error if the user is not authenticated.
 * @throws {Error} Throws an error with the message "User not found" if the user is not found.
 * @returns {Promise<void>} Resolves when the phone number has been successfully updated.
 */
export const updatePhoneNumber = async (params: UpdatePhoneParams): Promise<void> => {
  const paramsPayload = ParamsSchema.parse(params);
  const session = await auth();

  if (!session?.user?.id) throw new Error("User not authenticated");

  const profileService = new ProfileApplicationService(new PrismaProfileRepository());

  await profileService.updateProfile({
    id: session.user.id,
    phone: paramsPayload.phone
  });
};
