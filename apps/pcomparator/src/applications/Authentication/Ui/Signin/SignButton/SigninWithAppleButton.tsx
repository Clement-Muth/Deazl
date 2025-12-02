"use client";

import { Button } from "@heroui/react";
import { useLingui } from "@lingui/react/macro";
import { Loader2 } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { useNativeGoogleAuth } from "~/applications/Authentication/Ui/hooks/useNativeGoogleAuth";

export const SigninWithAppleButton = () => {
  const { t } = useLingui();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/";

  const { signInWithApple, isLoading, error, isIOS } = useNativeGoogleAuth(callbackUrl);

  if (!isIOS) return null;

  return (
    <form action={signInWithApple}>
      {error && <p className="text-red-500 text-sm mb-2 text-center">{error}</p>}
      <Button
        type="submit"
        className="group relative w-full overflow-hidden bg-black hover:bg-gray-900 text-white transition-all duration-300"
        startContent={
          isLoading ? (
            <Loader2 className="w-5 h-5 mr-2 animate-spin" />
          ) : (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width={20}
              height={20}
              viewBox="0 0 24 24"
              fill="currentColor"
              className="mr-2"
            >
              <title>Apple</title>
              <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09l.01-.01zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z" />
            </svg>
          )
        }
        size="lg"
        isDisabled={isLoading}
      >
        <span className="relative z-10 text-base">
          {isLoading ? t`Signing in...` : t`Sign in with Apple`}
        </span>
      </Button>
    </form>
  );
};
