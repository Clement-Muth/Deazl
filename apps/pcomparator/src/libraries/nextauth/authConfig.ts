import { PrismaAdapter } from "@auth/prisma-adapter";
import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import { type NextRequest, NextResponse } from "next/server";
import { prisma } from "~/libraries/prisma";

export const { auth, handlers, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma) as any,
  providers: [
    Google({
      clientId: process.env.AUTH_GOOGLE_ID,
      clientSecret: process.env.AUTH_GOOGLE_SECRET
    })
  ],
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

export const withAuthentication = (
  callback: (request: NextRequest, ctx: any) => Promise<NextResponse | Response>
) =>
  auth(async (request, ctx) => {
    if (request.auth) return await callback(request, ctx);

    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  });
