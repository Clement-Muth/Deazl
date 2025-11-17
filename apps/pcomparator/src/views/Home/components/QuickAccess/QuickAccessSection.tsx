"use client";

import { Trans } from "@lingui/react/macro";
import { LineChart, ScanBarcode, ShoppingCart } from "lucide-react";

import { NewPriceButton } from "~/applications/Prices/Ui/NewPrice/NewPriceButton";
import { Searchbar } from "~/applications/Searchbar/Ui/Searchbar";
import { QuickAccessCard } from "~/components/ui/QuickAccessCard";

interface QuickAccessSectionProps {
  userName?: string;
}

export function QuickAccessSection({ userName }: QuickAccessSectionProps) {
  return (
    <div className="flex-1 flex flex-col px-4 py-12 md:py-16">
      <div className="flex flex-col max-w-6xl mx-auto w-full">
        <div className="text-center md:text-left mb-12">
          <h1 className="font-display mb-3 text-3xl font-bold tracking-[-0.02em] drop-shadow-sm md:text-4xl">
            <Trans>Hello {userName}</Trans>
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            <Trans>What would you like to do today?</Trans>
          </p>
        </div>

        <div className="w-full max-w-2xl mx-auto mb-12">
          <Searchbar startContent={<NewPriceButton data-new-price-button />} />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <QuickAccessCard
            icon={<ShoppingCart className="w-6 h-6" />}
            title={<Trans>Shopping Lists</Trans>}
            description={
              <Trans>
                Create and manage your shopping lists. Track items, prices, and collaborate with others.
              </Trans>
            }
            href="/shopping-lists"
          />
          <QuickAccessCard
            icon={<LineChart className="w-6 h-6" />}
            title={<Trans>Price History</Trans>}
            description={<Trans>View price trends over time. Monitor changes and find the best deals.</Trans>}
            href="/dashboard/my-prices"
          />
          <QuickAccessCard
            icon={<ScanBarcode className="w-6 h-6" />}
            title={<Trans>Add New Price</Trans>}
            description={
              <Trans>
                Help the community by contributing new prices. Scan barcodes or enter prices manually.
              </Trans>
            }
            onClick={() => document.querySelector<HTMLButtonElement>("[data-new-price-button]")?.click()}
          />
        </div>
      </div>
    </div>
  );
}
