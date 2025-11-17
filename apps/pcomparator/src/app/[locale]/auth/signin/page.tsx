"use client";

import { Trans } from "@lingui/react/macro";
import { Heart, Loader2 } from "lucide-react";
import { useSession } from "next-auth/react";
import Image from "next/image";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import LogoImage from "public/static/logo.png";
import { useEffect } from "react";
import { Balancer } from "react-wrap-balancer";
import { SigninWithGoogleButton } from "~/applications/Authentication/Ui/Signin/SignButton/SigninWithGoogleButton";
import { GridBackground } from "~/views/Home/components/GridBackground";

export default function SigninPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/";

  useEffect(() => {
    if (status === "authenticated") {
      router.push(callbackUrl);
    }
  }, [status, router, callbackUrl]);

  if (status === "loading" || status === "authenticated") {
    return (
      <main className="relative -mt-[4rem] flex flex-1 w-full flex-col min-h-screen">
        <div className="absolute isolate overflow-hidden min-h-[calc(100dvh)] w-full flex items-center">
          <GridBackground />
        </div>
        <div className="relative min-h-screen flex flex-col items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-primary-600 dark:text-primary-400" />
          <p className="mt-4 text-gray-600 dark:text-gray-400">
            <Trans>Redirecting...</Trans>
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="relative -mt-[4rem] flex flex-1 w-full flex-col min-h-screen">
      <div className="absolute isolate overflow-hidden min-h-[calc(100dvh)] w-full flex items-center">
        <GridBackground />
      </div>

      <div className="relative min-h-screen flex flex-col items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <div className="flex justify-center transform hover:scale-105 transition-all duration-300">
              <Link href="/" className="relative block rounded-3xl bg-white shadow-xl">
                <div className="absolute inset-0 bg-gradient-to-br from-primary-100 via-white to-primary-50 dark:from-primary-900 dark:via-gray-900 dark:to-primary-950 opacity-50 rounded-3xl" />
                <Image
                  src={LogoImage}
                  alt="Deazl Logo"
                  width={80}
                  height={80}
                  className="relative p-4"
                  priority
                />
              </Link>
            </div>

            <div className="inline-flex items-center justify-center gap-2 rounded-full bg-primary-50 px-4 py-1.5 mt-8 mb-6 dark:bg-primary-900/50">
              <Heart className="w-4 h-4 text-primary-600 dark:text-primary-400" />
              <span className="text-sm font-medium text-primary-600 dark:text-primary-400">
                <Trans>For the community</Trans>
              </span>
            </div>
            <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 dark:from-white dark:via-gray-100 dark:to-white bg-clip-text text-transparent">
              <Balancer>
                <Trans>Sign in</Trans>
              </Balancer>
            </h1>
            <p className="text-lg text-gray-600 dark:text-gray-300 mb-8">
              <Balancer>
                <Trans>Join our community and start saving money on your daily groceries.</Trans>
              </Balancer>
            </p>
          </div>

          <div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm rounded-2xl p-8 shadow-lg border border-gray-200 dark:border-gray-800">
            <div className="relative">
              <div className="relative space-y-6">
                <SigninWithGoogleButton />

                <div className="text-center mt-8">
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    <Trans>
                      By signing in, you agree to our{" "}
                      <Link
                        href="/terms"
                        className="text-primary-600 hover:text-primary-500 dark:text-primary-400"
                      >
                        terms of service
                      </Link>{" "}
                      and{" "}
                      <Link
                        href="/privacy"
                        className="text-primary-600 hover:text-primary-500 dark:text-primary-400"
                      >
                        privacy policy
                      </Link>
                      .
                    </Trans>
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="text-center mt-8">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              <Trans>
                Deazl is a 100% free and open source application.{" "}
                <Link
                  href="https://github.com/yourusername/pcomparator"
                  className="text-primary-600 hover:text-primary-500 dark:text-primary-400"
                >
                  View on GitHub
                </Link>
              </Trans>
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
