"use server";

import type { User } from "@prisma/client";
import { cookies } from "next/headers";
import { prisma } from "~/libraries/prisma";

interface GoogleNativeAuthPayload {
  idToken: string;
  accessToken: string | null;
  profile: {
    id: string | null;
    email: string | null;
    name: string | null;
    givenName: string | null;
    familyName: string | null;
    imageUrl: string | null;
  };
}

interface SessionResult {
  success: boolean;
  error?: string;
  user?: {
    id: string;
    email: string | null;
    name: string | null;
    image: string | null;
  };
}

export async function createSessionFromGoogle(payload: GoogleNativeAuthPayload): Promise<SessionResult> {
  try {
    const { profile, idToken } = payload;

    if (!profile.email || !profile.id) {
      return { success: false, error: "Missing email or Google ID" };
    }

    const existingAccount = await prisma.account.findFirst({
      where: {
        provider: "google",
        providerAccountId: profile.id
      },
      include: { user: true }
    });

    let user: User;

    if (existingAccount) {
      user = existingAccount.user;

      await prisma.account.update({
        where: {
          provider_providerAccountId: {
            provider: "google",
            providerAccountId: profile.id
          }
        },
        data: {
          id_token: idToken,
          access_token: payload.accessToken
        }
      });
    } else {
      const existingUser = await prisma.user.findUnique({
        where: { email: profile.email }
      });

      if (existingUser) {
        await prisma.account.create({
          data: {
            userId: existingUser.id,
            type: "oauth",
            provider: "google",
            providerAccountId: profile.id,
            id_token: idToken,
            access_token: payload.accessToken,
            token_type: "Bearer",
            scope: "openid profile email"
          }
        });
        user = existingUser;
      } else {
        user = await prisma.user.create({
          data: {
            email: profile.email,
            name: profile.name,
            image: profile.imageUrl,
            accounts: {
              create: {
                type: "oauth",
                provider: "google",
                providerAccountId: profile.id,
                id_token: idToken,
                access_token: payload.accessToken,
                token_type: "Bearer",
                scope: "openid profile email"
              }
            }
          }
        });
      }
    }

    const sessionToken = crypto.randomUUID();
    const expires = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

    await prisma.session.create({
      data: {
        sessionToken,
        userId: user.id,
        expires
      }
    });

    const cookieStore = await cookies();
    cookieStore.set("next-auth.session-token-v2", sessionToken, {
      expires,
      httpOnly: true,
      sameSite: "lax",
      path: "/",
      secure: process.env.NODE_ENV === "production"
    });

    return {
      success: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        image: user.image
      }
    };
  } catch (error) {
    console.error("Error creating session from Google:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error"
    };
  }
}
