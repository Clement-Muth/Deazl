import { del, put } from "@vercel/blob";
import { NextResponse } from "next/server";
import { errorHandler } from "~/core/errorHandler";
import { withAuthentication } from "~/libraries/nextauth/authConfig";
import { prisma } from "~/libraries/prisma";
import { HttpStatus } from "~/types/httpError";

export const PATCH = withAuthentication(
  errorHandler(async (request, ctx): Promise<NextResponse> => {
    const { searchParams } = new URL(request.url);
    const { id } = await (ctx.params as unknown as Promise<{ id: string }>);

    const filename = searchParams.get("filename");

    if (!(filename && request.body)) throw new Error("filename or body empty.");

    // Get current user
    const userId = (request as any).auth?.user?.id;
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: HttpStatus.UNAUTHORIZED });
    }

    // Verify recipe exists and user has permission
    const recipe = await prisma.recipe.findUnique({
      where: { id }
    });

    if (!recipe) {
      return NextResponse.json({ error: "Recipe not found" }, { status: HttpStatus.NOT_FOUND });
    }

    if (recipe.userId !== userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: HttpStatus.FORBIDDEN });
    }

    // Delete old image if exists
    if (recipe.imageUrl) {
      try {
        await del(recipe.imageUrl);
      } catch (error) {
        console.error("Failed to delete old image:", error);
      }
    }

    // Upload new image
    const blob = await put(`recipes/${id}/${filename}`, request.body, {
      access: "public"
    });

    // Update recipe with new image URL
    const updatedRecipe = await prisma.recipe.update({
      data: { imageUrl: blob.url },
      where: { id }
    });

    return NextResponse.json({ imageUrl: updatedRecipe.imageUrl! }, { status: HttpStatus.OK });
  })
);

export const DELETE = withAuthentication(
  errorHandler(async (request, ctx): Promise<NextResponse> => {
    const { id } = await (ctx.params as unknown as Promise<{ id: string }>);

    // Get current user
    const userId = (request as any).auth?.user?.id;
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: HttpStatus.UNAUTHORIZED });
    }

    // Verify recipe exists and user has permission
    const recipe = await prisma.recipe.findUnique({
      where: { id }
    });

    if (!recipe) {
      return NextResponse.json({ error: "Recipe not found" }, { status: HttpStatus.NOT_FOUND });
    }

    if (recipe.userId !== userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: HttpStatus.FORBIDDEN });
    }

    // Delete image from blob storage
    if (recipe.imageUrl) {
      try {
        await del(recipe.imageUrl);
      } catch (error) {
        console.error("Failed to delete image:", error);
      }
    }

    // Remove image URL from database
    await prisma.recipe.update({
      data: { imageUrl: null },
      where: { id }
    });

    return NextResponse.json({ success: true }, { status: HttpStatus.OK });
  })
);
