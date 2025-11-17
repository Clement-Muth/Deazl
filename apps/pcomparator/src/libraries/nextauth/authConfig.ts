import { PrismaAdapter } from "@auth/prisma-adapter";
import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import { NextResponse } from "next/server";
import { prisma } from "~/libraries/prisma";

export const { auth, handlers, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma),
  providers: [Google],
  trustHost: true

  // callbacks: {
  //   async session({ session, user }) {
  //     session.user = user;
  //     return session;
  //   }
  // }
});

export const withAuthentication = (callback: Parameters<typeof auth>[0]) =>
  auth(async (request, ctx) => {
    if (request.auth) return await callback(request, ctx);

    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  });
