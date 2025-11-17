import { put } from "@vercel/blob";
import { NextResponse } from "next/server";
import { errorHandler } from "~/core/errorHandler";
import { withAuthentication } from "~/libraries/nextauth/authConfig";
import { prisma } from "~/libraries/prisma";
import { HttpStatus } from "~/types/httpError";

type PostReturn = NextResponse<{ image: string }>;

export const PATCH = withAuthentication(
  errorHandler(async (request, ctx): Promise<PostReturn> => {
    const { searchParams } = new URL(request.url);
    const { id } = await (ctx.params as unknown as Promise<{ id: string }>);

    const filename = searchParams.get("filename");

    if (!(filename && request.body)) throw new Error("filename or body empty.");

    const blob = await put(`users/${id}/profile/avatar/${filename}`, request.body, {
      access: "public"
    });

    const url = await prisma.user.update({ data: { image: blob.url }, where: { id: id } });
    return NextResponse.json({ image: url.image! }, { status: HttpStatus.OK });
  })
);
