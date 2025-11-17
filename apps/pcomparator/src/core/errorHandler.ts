import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library";
import { type NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { HTTPError } from "~/types/error";

export const errorHandler = (
  callback: (request: NextRequest, ctx: any) => Promise<NextResponse | Response>
) => {
  return async (request: NextRequest, ctx: any): Promise<NextResponse | Response> => {
    try {
      return await callback(request, ctx);
    } catch (error) {
      const isDev = process.env.PCOMPARATOR_ENV === "development";

      if (isDev) console.error("Error:", error);

      if (error instanceof z.ZodError) {
        return NextResponse.json(
          new HTTPError(
            "The request is malformed or contains invalid parameters. Please check the data provided.",
            400,
            "error cause"
          ),
          { status: 400 }
        );
      }

      if (error instanceof PrismaClientKnownRequestError) {
        switch ((error as PrismaClientKnownRequestError).code) {
          case "P2002":
            return NextResponse.json({ error: "A similar entry already exists." }, { status: 409 });
          case "P2025":
            return NextResponse.json(
              { error: "The requested resource could not be found." },
              { status: 404 }
            );
          default:
            return NextResponse.json({ error: "Internal Server Error." }, { status: 500 });
        }
      }

      return NextResponse.json({ error: "Internal Server Error." }, { status: 500 });
    }
  };
};
