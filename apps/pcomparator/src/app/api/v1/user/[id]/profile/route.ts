import { NextResponse } from "next/server";
import { z } from "zod";
import { PrismaProfileRepository } from "~/applications/Profile/Infrastructure/PrismaUserRepository";
import { errorHandler } from "~/core/errorHandler";
import { withAuthentication } from "~/libraries/nextauth/authConfig";
import { HttpStatus } from "~/types/httpError";

export const ParamsSchema = z.object({
  phone: z.string().optional(),
  name: z.string().optional()
});

const profileRepository = new PrismaProfileRepository();

export const PATCH = withAuthentication(
  errorHandler(async (request, ctx): Promise<NextResponse> => {
    const { id } = await (ctx.params as unknown as Promise<{ id: string }>);

    const payload = ParamsSchema.parse(await request.json());

    const updatedProfile = await profileRepository.update({ id: id, ...payload });

    return NextResponse.json(updatedProfile, { status: HttpStatus.OK });
  })
);
