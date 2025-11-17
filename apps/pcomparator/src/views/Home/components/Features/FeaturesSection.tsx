"use client";

import { Trans } from "@lingui/react/macro";
import { LineChart, ScanBarcode, ShoppingCart } from "lucide-react";
import Link from "next/link";
import type { JSX } from "react";

interface FeatureCardProps {
  icon: JSX.Element;
  title: React.ReactNode;
  description: React.ReactNode;
}

function FeatureCard({ icon, title, description }: FeatureCardProps) {
  return (
    <div className="group flex flex-col items-center text-center p-8 rounded-2xl bg-white dark:bg-gray-900 shadow-sm hover:shadow-md transition-all duration-300">
      <div className="w-16 h-16 rounded-2xl bg-primary-50 dark:bg-primary-900/50 flex items-center justify-center mb-6 transition-transform group-hover:scale-110 duration-300">
        {icon}
      </div>
      <h3 className="text-xl font-semibold mb-3">{title}</h3>
      <p className="text-gray-600 dark:text-gray-400">{description}</p>
    </div>
  );
}

export function FeaturesSection() {
  return (
    <div className="py-16 md:py-24 px-4 bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-800">
      <div className="max-w-7xl mx-auto">
        <h2 className="text-center text-3xl md:text-4xl font-bold mb-6">
          <Trans>Why choose Deazl?</Trans>
        </h2>
        <p className="text-center text-lg text-gray-600 dark:text-gray-400 max-w-3xl mx-auto mb-4">
          <Trans>
            A free and open source solution to manage your shopping and save on your daily purchases.
          </Trans>
        </p>
        <p className="text-center text-sm text-primary-600 dark:text-primary-400 max-w-3xl mx-auto mb-16">
          <Trans>
            Contribute to improving the app and support the project via{" "}
            <Link href="/donate" className="underline hover:no-underline">
              a donation
            </Link>
          </Trans>
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <FeatureCard
            icon={<ShoppingCart className="w-8 h-8 text-primary-600 dark:text-primary-400" />}
            title={<Trans>Smart shopping lists</Trans>}
            description={
              <Trans>
                Create and share your shopping lists. Track prices and collaborate with your loved ones.
              </Trans>
            }
          />
          <FeatureCard
            icon={<LineChart className="w-8 h-8 text-primary-600 dark:text-primary-400" />}
            title={<Trans>Price tracking</Trans>}
            description={<Trans>Monitor price changes over time and find the best deals.</Trans>}
          />
          <FeatureCard
            icon={<ScanBarcode className="w-8 h-8 text-primary-600 dark:text-primary-400" />}
            title={<Trans>Community contribution</Trans>}
            description={<Trans>Help enrich the database by adding new prices.</Trans>}
          />
        </div>
      </div>
    </div>
  );
}
