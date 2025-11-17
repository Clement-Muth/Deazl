"use client";

import { Button } from "@heroui/react";
import { Trans } from "@lingui/react/macro";
import { AlertCircle, MoveLeft, RotateCcw } from "lucide-react";
import Link from "next/link";
import { GridBackground } from "~/views/Home/components/GridBackground";

interface ErrorProps {
  error: Error;
  reset: () => void;
}

export default function Error({ error, reset }: ErrorProps) {
  return (
    <main className="relative -mt-[4rem] flex flex-1 w-full flex-col min-h-screen">
      <div className="absolute isolate overflow-hidden min-h-[calc(100dvh)] w-full flex items-center">
        <GridBackground />
      </div>
      <div className="relative flex flex-col items-center justify-center min-h-screen p-4">
        <div className="flex flex-col items-center text-center space-y-8">
          <div className="relative">
            <div className="absolute -inset-1 bg-gradient-to-r from-red-600 via-red-500 to-red-600 rounded-xl blur opacity-30" />
            <div className="relative">
              <AlertCircle className="w-24 h-24 text-red-600 dark:text-red-500" />
            </div>
          </div>

          <div className="space-y-4 max-w-md">
            <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">
              <Trans>An error occurred</Trans>
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              <Trans>
                We apologize, but something went wrong. Our team has been notified and is working to resolve
                the issue.
              </Trans>
            </p>
            <p className="text-sm text-red-600 dark:text-red-400 font-mono bg-red-50 dark:bg-red-900/20 p-2 rounded-lg">
              {error.message}
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4">
            <Button onPress={reset} color="primary" startContent={<RotateCcw className="w-5 h-5" />}>
              <Trans>Try Again</Trans>
            </Button>

            <Button as={Link} href="/" color="default" startContent={<MoveLeft className="w-5 h-5" />}>
              <Trans>Back to Home</Trans>
            </Button>
          </div>
        </div>
      </div>
    </main>
  );
}
