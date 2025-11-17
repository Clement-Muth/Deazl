import { PrismaAdapter } from "@auth/prisma-adapter";
import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import { NextResponse } from "next/server";
import { prisma } from "../prisma";

export const { auth, handlers, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma) as any,
  providers: [Google],
  trustHost: true,
  session: { strategy: "database" },
  cookies: {
    sessionToken: {
      name: "next-auth.session-token-v2"
    }
  },

  callbacks: {
    async session({ session, user }) {
      session.user.id = user.id;
      return session;
    }
  }
});

export const withAuthentication = (callback: (request: any, ctx: any) => Promise<Response> | Response) =>
  auth(async (request, ctx) => {
    if (request.auth) return await callback(request, ctx);

    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  });
