"use client";

import { Capacitor } from "@capacitor/core";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";

interface GoogleLoginResult {
  provider: "google";
  result: {
    accessToken: { token: string } | null;
    idToken: string | null;
    profile: {
      email: string | null;
      familyName: string | null;
      givenName: string | null;
      id: string | null;
      name: string | null;
      imageUrl: string | null;
    };
    responseType: "online";
  };
}

interface AppleLoginResult {
  provider: "apple";
  result: {
    identityToken: string | null;
    authorizationCode: string | null;
    user: {
      email: string | null;
      name: {
        firstName: string | null;
        lastName: string | null;
      } | null;
    } | null;
  };
}

interface UseNativeGoogleAuthReturn {
  signIn: () => Promise<void>;
  signInWithApple: () => Promise<void>;
  isLoading: boolean;
  error: string | null;
  isNativePlatform: boolean;
  isIOS: boolean;
  isAndroid: boolean;
}

export const useNativeGoogleAuth = (callbackUrl = "/"): UseNativeGoogleAuthReturn => {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const isNativePlatform = Capacitor.isNativePlatform();
  const isIOS = Capacitor.getPlatform() === "ios";
  const isAndroid = Capacitor.getPlatform() === "android";

  useEffect(() => {
    const initializeSocialLogin = async () => {
      if (!isNativePlatform || isInitialized) return;

      try {
        const { SocialLogin } = await import("@capgo/capacitor-social-login");

        const initOptions: {
          google?: { webClientId?: string; iOSClientId?: string };
          apple?: { clientId?: string };
        } = {
          google: {
            webClientId: process.env.AUTH_GOOGLE_ID
          }
        };

        if (isIOS) {
          initOptions.google = {
            ...initOptions.google,
            iOSClientId: process.env.NEXT_PUBLIC_GOOGLE_IOS_CLIENT_ID
          };
          initOptions.apple = {
            clientId: process.env.NEXT_PUBLIC_APPLE_CLIENT_ID
          };
        }

        await SocialLogin.initialize(initOptions);

        console.log("✅ SocialLogin initialized successfully");
        setIsInitialized(true);
      } catch (err) {
        console.error("❌ Failed to initialize SocialLogin:", err);
        setError("Failed to initialize Social Sign-In");
      }
    };

    initializeSocialLogin();
  }, [isNativePlatform, isInitialized, isIOS]);

  const signIn = useCallback(async () => {
    if (!isNativePlatform) {
      setError("Native Google Sign-In is only available on mobile");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const { SocialLogin } = await import("@capgo/capacitor-social-login");

      const initOptions: {
        google?: { webClientId?: string; iOSClientId?: string };
      } = {
        google: {
          webClientId: process.env.AUTH_GOOGLE_ID
        }
      };

      if (isIOS) {
        initOptions.google = {
          ...initOptions.google,
          iOSClientId: process.env.NEXT_PUBLIC_GOOGLE_IOS_CLIENT_ID
        };
      }

      await SocialLogin.initialize(initOptions);

      // @ts-ignore
      const result = (await SocialLogin.login({
        provider: "google"
      })) as GoogleLoginResult;

      if (!result.result.idToken || !result.result.profile.id) {
        throw new Error("Missing required authentication data");
      }

      const { createSessionFromGoogle } = await import(
        "~/applications/Authentication/Api/createSessionFromGoogle.api"
      );

      const sessionResult = await createSessionFromGoogle({
        idToken: result.result.idToken,
        accessToken: result.result.accessToken?.token ?? null,
        profile: {
          id: result.result.profile.id,
          email: result.result.profile.email,
          name: result.result.profile.name,
          givenName: result.result.profile.givenName,
          familyName: result.result.profile.familyName,
          imageUrl: result.result.profile.imageUrl
        }
      });

      if (!sessionResult.success) {
        throw new Error(sessionResult.error || "Failed to create session");
      }

      router.push(callbackUrl);
      router.refresh();
    } catch (err) {
      console.error("Google Sign-In error:", err);
      setError(err instanceof Error ? err.message : "Sign-in failed");
    } finally {
      setIsLoading(false);
    }
  }, [isNativePlatform, isIOS, callbackUrl, router]);

  const signInWithApple = useCallback(async () => {
    if (!isNativePlatform || !isIOS) {
      setError("Apple Sign-In is only available on iOS");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const { SocialLogin } = await import("@capgo/capacitor-social-login");

      await SocialLogin.initialize({
        apple: {
          clientId: process.env.NEXT_PUBLIC_APPLE_CLIENT_ID
        }
      });

      // @ts-ignore
      const result = (await SocialLogin.login({
        provider: "apple",
        options: {
          scopes: ["email", "name"]
        }
      })) as AppleLoginResult;

      if (!result.result.identityToken) {
        throw new Error("Missing required Apple authentication data");
      }

      const { createSessionFromApple } = await import(
        "~/applications/Authentication/Api/createSessionFromApple.api"
      );

      const sessionResult = await createSessionFromApple({
        identityToken: result.result.identityToken,
        authorizationCode: result.result.authorizationCode,
        user: result.result.user
      });

      if (!sessionResult.success) {
        throw new Error(sessionResult.error || "Failed to create session");
      }

      router.push(callbackUrl);
      router.refresh();
    } catch (err) {
      console.error("Apple Sign-In error:", err);
      setError(err instanceof Error ? err.message : "Sign-in failed");
    } finally {
      setIsLoading(false);
    }
  }, [isNativePlatform, isIOS, callbackUrl, router]);

  return {
    signIn,
    signInWithApple,
    isLoading,
    error,
    isNativePlatform,
    isIOS,
    isAndroid
  };
};
