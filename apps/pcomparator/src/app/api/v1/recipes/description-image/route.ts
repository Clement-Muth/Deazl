import { put } from "@vercel/blob";
import { NextResponse } from "next/server";
import { errorHandler } from "~/core/errorHandler";
import { withAuthentication } from "~/libraries/nextauth/authConfig";
import { HttpStatus } from "~/types/httpError";

/**
 * API route pour uploader les images des descriptions de recettes
 * Utilisé par Tiptap Image extension
 */
export const POST = withAuthentication(
  errorHandler(async (request): Promise<NextResponse> => {
    const userId = (request as any).auth?.user?.id;
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: HttpStatus.UNAUTHORIZED });
    }

    const formData = await request.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: HttpStatus.BAD_REQUEST });
    }

    // Validate file type (images only)
    if (!file.type.startsWith("image/")) {
      return NextResponse.json({ error: "Only images are allowed" }, { status: HttpStatus.BAD_REQUEST });
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json({ error: "File too large (max 5MB)" }, { status: HttpStatus.BAD_REQUEST });
    }

    // Upload to Vercel Blob
    const blob = await put(`recipe-descriptions/${userId}/${Date.now()}-${file.name}`, file, {
      access: "public"
    });

    return NextResponse.json({ url: blob.url }, { status: HttpStatus.OK });
  })
);
