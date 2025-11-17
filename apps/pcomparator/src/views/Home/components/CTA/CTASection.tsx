"use client";

import { Button } from "@heroui/react";
import { Trans } from "@lingui/react/macro";
import Link from "next/link";

export function CTASection() {
  return (
    <div className="relative py-24 px-4 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-primary-50 via-primary-100 to-primary-50 dark:from-primary-950 dark:via-primary-900 dark:to-primary-950 opacity-50" />
      <div className="relative max-w-3xl mx-auto text-center">
        <h2 className="text-3xl md:text-4xl font-bold mb-6">
          <Trans>Ready to start saving?</Trans>
        </h2>
        <p className="text-xl text-gray-700 dark:text-gray-300 mb-8">
          <Trans>
            Join thousands of users already saving with Deazl. Registration is free and only takes a few
            seconds.
          </Trans>
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button
            as={Link}
            href="/auth/signin"
            color="primary"
            variant="light"
            size="lg"
            className="group relative overflow-hidden px-8"
          >
            <span className="relative z-10">
              <Trans>Create a free account</Trans>
            </span>
            <div className="absolute inset-0 bg-gradient-to-r from-primary-600 to-primary-500 dark:from-primary-500 dark:to-primary-400 transform transition-transform duration-300 group-hover:scale-110" />
          </Button>
          <Button
            as={Link}
            href="/about"
            variant="bordered"
            size="lg"
            className="group hover:bg-gray-50 dark:hover:bg-gray-800"
          >
            <Trans>Learn more</Trans>
          </Button>
        </div>
        <p className="mt-6 text-sm text-gray-600 dark:text-gray-400">
          <Trans>Already over 10,000 products referenced and new prices added every day.</Trans>
        </p>
      </div>
    </div>
  );
}
