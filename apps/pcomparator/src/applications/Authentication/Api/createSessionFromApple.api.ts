"use server";

import type { User } from "@prisma/client";
import { cookies } from "next/headers";
import { prisma } from "~/libraries/prisma";

interface AppleNativeAuthPayload {
  identityToken: string;
  authorizationCode: string | null;
  user: {
    email: string | null;
    name: {
      firstName: string | null;
      lastName: string | null;
    } | null;
  } | null;
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

function decodeAppleIdentityToken(identityToken: string): {
  sub: string;
  email?: string;
  email_verified?: boolean;
} | null {
  try {
    const parts = identityToken.split(".");
    if (parts.length !== 3) return null;

    const payload = JSON.parse(Buffer.from(parts[1], "base64url").toString("utf-8"));
    return payload;
  } catch {
    return null;
  }
}

export async function createSessionFromApple(payload: AppleNativeAuthPayload): Promise<SessionResult> {
  try {
    const tokenPayload = decodeAppleIdentityToken(payload.identityToken);

    if (!tokenPayload?.sub) {
      return { success: false, error: "Invalid Apple identity token" };
    }

    const appleUserId = tokenPayload.sub;
    const email = payload.user?.email || tokenPayload.email || null;
    const firstName = payload.user?.name?.firstName || null;
    const lastName = payload.user?.name?.lastName || null;
    const fullName = [firstName, lastName].filter(Boolean).join(" ") || null;

    const existingAccount = await prisma.account.findFirst({
      where: {
        provider: "apple",
        providerAccountId: appleUserId
      },
      include: { user: true }
    });

    let user: User;

    if (existingAccount) {
      user = existingAccount.user;

      await prisma.account.update({
        where: {
          provider_providerAccountId: {
            provider: "apple",
            providerAccountId: appleUserId
          }
        },
        data: {
          id_token: payload.identityToken
        }
      });
    } else {
      const existingUser = email
        ? await prisma.user.findUnique({
            where: { email }
          })
        : null;

      if (existingUser) {
        await prisma.account.create({
          data: {
            userId: existingUser.id,
            type: "oauth",
            provider: "apple",
            providerAccountId: appleUserId,
            id_token: payload.identityToken,
            token_type: "Bearer",
            scope: "openid email name"
          }
        });
        user = existingUser;
      } else {
        if (!email) {
          return { success: false, error: "Email is required for new users" };
        }

        user = await prisma.user.create({
          data: {
            email,
            name: fullName,
            accounts: {
              create: {
                type: "oauth",
                provider: "apple",
                providerAccountId: appleUserId,
                id_token: payload.identityToken,
                token_type: "Bearer",
                scope: "openid email name"
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
    console.error("Error creating session from Apple:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error"
    };
  }
}
