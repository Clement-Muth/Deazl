"use client";

import { Trans } from "@lingui/react/macro";

interface DashboardHeaderProps {
  userName?: string;
}

export function DashboardHeader({ userName }: DashboardHeaderProps) {
  return (
    <div className="mb-6 sm:mb-8">
      <h1 className="font-display text-2xl sm:text-3xl font-bold mb-2 bg-linear-to-r from-gray-900 via-gray-800 to-gray-900 dark:from-white dark:via-gray-100 dark:to-white bg-clip-text text-transparent">
        <Trans>Welcome back, {userName || "there"}</Trans>
      </h1>
      <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400">
        <Trans>Let's find the best deals for your shopping!</Trans>
      </p>
    </div>
  );
}
