"use client";

import { Button } from "@heroui/react";
import { useLingui } from "@lingui/react/macro";
import { Loader2 } from "lucide-react";
import { signIn } from "next-auth/react";
import { useSearchParams } from "next/navigation";
import { useState } from "react";
import { useNativeGoogleAuth } from "~/applications/Authentication/Ui/hooks/useNativeGoogleAuth";

export const SigninWithGoogleButton = () => {
  const { t } = useLingui();
  const [isLoading, setIsLoading] = useState(false);
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/";

  const { signIn: nativeSignIn, error: nativeError, isNativePlatform } = useNativeGoogleAuth(callbackUrl);

  const handleSignIn = async () => {
    if (isNativePlatform) await nativeSignIn();
    else {
      try {
        setIsLoading(true);
        await signIn("google");
      } catch (error) {
        console.error("Error signing in:", error);
        setIsLoading(false);
      }
    }
  };

  return (
    <form action={handleSignIn}>
      {nativeError && <p className="text-red-500 text-sm mb-2 text-center">{nativeError}</p>}
      <Button
        type="submit"
        className="group relative w-full overflow-hidden bg-white hover:bg-gray-50 dark:bg-gray-900 dark:hover:bg-gray-800 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-800 hover:border-gray-300 dark:hover:border-gray-700 transition-all duration-300"
        startContent={
          isLoading ? (
            <Loader2 className="w-5 h-5 mr-2 animate-spin text-gray-600 dark:text-gray-400" />
          ) : (
            <div className="relative flex items-center justify-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width={26}
                height={26}
                viewBox="0 0 48 48"
                className="mr-2"
              >
                <title>Google</title>
                <path
                  fill="#FFC107"
                  d="M43.611 20.083H42V20H24v8h11.303c-1.649 4.657-6.08 8-11.303 8-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 12.955 4 4 12.955 4 24s8.955 20 20 20 20-8.955 20-20c0-1.341-.138-2.65-.389-3.917z"
                />
                <path
                  fill="#FF3D00"
                  d="m6.306 14.691 6.571 4.819C14.655 15.108 18.961 12 24 12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 16.318 4 9.656 8.337 6.306 14.691z"
                />
                <path
                  fill="#4CAF50"
                  d="M24 44c5.166 0 9.86-1.977 13.409-5.192l-6.19-5.238A11.91 11.91 0 0 1 24 36c-5.202 0-9.619-3.317-11.283-7.946l-6.522 5.025C9.505 39.556 16.227 44 24 44z"
                />
                <path
                  fill="#1976D2"
                  d="M43.611 20.083H42V20H24v8h11.303a12.04 12.04 0 0 1-4.087 5.571l.003-.002 6.19 5.238C36.971 39.205 44 34 44 24c0-1.341-.138-2.65-.389-3.917z"
                />
              </svg>
            </div>
          )
        }
        size="lg"
        variant="bordered"
        isDisabled={isLoading}
      >
        <span className="relative z-10 text-base">
          {isLoading ? t`Signing in...` : t`Sign in with Google`}
        </span>
      </Button>
    </form>
  );
};
