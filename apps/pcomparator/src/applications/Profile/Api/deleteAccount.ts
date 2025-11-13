"use server";

import { auth } from "~/libraries/nextauth/authConfig";
import { prisma } from "~/libraries/prisma";

/**
 * Deletes the authenticated user's account.
 *
 * @async
 * @function deleteAccount
 * @throws {Error} Throws an error if the user is not authenticated.
 * @throws {Error} Throws an error if the account is not found.
 * @returns {Promise<void>} Resolves to `void` upon successful account deletion.
 */
export const deleteAccount = async (): Promise<void> => {
  const session = await auth();

  if (!session?.user?.id) throw new Error("User not authenticated");

  await prisma.user.delete({
    where: { id: session.user.id }
  });
};
