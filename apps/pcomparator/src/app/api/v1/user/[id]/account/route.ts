import { del, list } from "@vercel/blob";
import { withAuthentication } from "~/libraries/nextauth/authConfig";
import { prisma } from "~/libraries/prisma";
import { HttpStatus } from "~/types/httpError";

export const DELETE = withAuthentication(async (request, ctx) => {
  const { id } = await (ctx.params as unknown as Promise<{ id: string }>);

  await prisma.user.delete({ where: { id } });

  const userAvatars = await list({ prefix: `users/${id}/profile/avatar/`, mode: "folded" });

  if (userAvatars.blobs.length > 0) await del(userAvatars.blobs.map((blob) => blob.url));

  return new Response(null, { status: HttpStatus.NO_CONTENT });
});
