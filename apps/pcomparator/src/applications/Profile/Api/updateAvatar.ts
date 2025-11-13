"use server";

import { put } from "@vercel/blob";
import { z } from "zod";
import { auth } from "~/libraries/nextauth/authConfig";
import { prisma } from "~/libraries/prisma";

const ParamsSchema = z.object({
  image: z.instanceof(File)
});

const PayloadSchema = z.object({
  image: z.string()
});

export type UpdateAvatarParams = z.infer<typeof ParamsSchema>;
export type UpdateAvatarPayload = z.infer<typeof PayloadSchema>;

/**
 * Updates the authenticated user's avatar.
 *
 * @async
 * @function updateAvatar
 * @param {z.infer<typeof ParamsSchema>} params - The parameters containing the image file to upload as the user's new avatar.
 * @throws {Error} Throws an error if the user is not authenticated.
 * @returns {Promise<UpdateAvatarPayload>} Resolves to an object containing the updated avatar image URL upon successful update.
 */
export const updateAvatar = async (params: z.infer<typeof ParamsSchema>): Promise<UpdateAvatarPayload> => {
  const paramsPayload = ParamsSchema.parse(params);
  const session = await auth();

  if (!session?.user?.id) throw new Error("User not authenticated");

  const filename = paramsPayload.image.name;
  const userId = session.user.id;

  // Upload to Vercel Blob
  const blob = await put(`users/${userId}/profile/avatar/${filename}`, paramsPayload.image, {
    access: "public"
  });

  // Update database with new avatar URL
  const updatedUser = await prisma.user.update({
    data: { image: blob.url },
    where: { id: userId },
    select: { image: true }
  });

  return {
    image: updatedUser.image!
  };
};
