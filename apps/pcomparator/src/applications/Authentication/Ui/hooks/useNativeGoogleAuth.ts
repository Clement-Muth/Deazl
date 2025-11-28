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

interface UseNativeGoogleAuthReturn {
  signIn: () => Promise<void>;
  isLoading: boolean;
  error: string | null;
  isNativePlatform: boolean;
}

export const useNativeGoogleAuth = (callbackUrl = "/"): UseNativeGoogleAuthReturn => {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const isNativePlatform = Capacitor.isNativePlatform();

  useEffect(() => {
    const initializeSocialLogin = async () => {
      if (!isNativePlatform || isInitialized) return;

      try {
        const { SocialLogin } = await import("@capgo/capacitor-social-login");

        // alert("🔧 Initializing with Web Client ID: " + process.env.NEXT_PUBLIC_GOOGLE_WEB_CLIENT_ID);

        await SocialLogin.initialize({
          google: {
            webClientId: process.env.NEXT_PUBLIC_GOOGLE_WEB_CLIENT_ID
            // N'ajoutez PAS androidClientId ici pour ce plugin
          }
        });

        console.log("✅ SocialLogin initialized successfully");
        setIsInitialized(true);
      } catch (err) {
        console.error("❌ Failed to initialize SocialLogin:", err);
        setError("Failed to initialize Google Sign-In");
      }
    };

    initializeSocialLogin();
  }, [isNativePlatform, isInitialized]);

  const signIn = useCallback(async () => {
    if (!isNativePlatform) {
      setError("Native Google Sign-In is only available on mobile");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const { SocialLogin } = await import("@capgo/capacitor-social-login");

      await SocialLogin.initialize({
        google: {
          webClientId: process.env.NEXT_PUBLIC_GOOGLE_WEB_CLIENT_ID
        }
      });

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
      alert(err);
      console.error("Google Sign-In error:", err);
      setError(err instanceof Error ? err.message : "Sign-in failed");
    } finally {
      setIsLoading(false);
    }
  }, [isNativePlatform, callbackUrl, router]);

  return {
    signIn,
    isLoading,
    error,
    isNativePlatform
  };
};
