"use server";

import { PrismaRecipeSharingRepository } from "../../../Infrastructure/Repositories/PrismaRecipeSharingRepository";

const sharingRepository = new PrismaRecipeSharingRepository();

export async function generateShareLink(recipeId: string): Promise<string> {
  try {
    const token = await sharingRepository.generateShareToken(recipeId);
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3001";
    return `${baseUrl}/recipes/shared/${token}`;
  } catch (error) {
    console.error("Failed to generate share link:", error);
    throw new Error("Failed to generate share link");
  }
}
