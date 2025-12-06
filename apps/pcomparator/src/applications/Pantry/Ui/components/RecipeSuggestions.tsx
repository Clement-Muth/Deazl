"use client";

import { Chip } from "@heroui/react";
import { Trans } from "@lingui/react/macro";
import { ChefHat, ChevronRight } from "lucide-react";
import Link from "next/link";
import type { PantryItemPayload } from "../../Domain/Schemas/PantryItem.schema";

interface RecipeSuggestionsProps {
  expiringItems: PantryItemPayload[];
}

export const RecipeSuggestions = ({ expiringItems }: RecipeSuggestionsProps) => {
  if (expiringItems.length === 0) return null;

  const names = expiringItems.slice(0, 3).map((i) => i.name);

  return (
    <Link href="/recipes" className="block">
      <div className="flex items-center gap-3 p-3 rounded-xl bg-primary-50 dark:bg-primary-900/20 active:bg-primary-100 dark:active:bg-primary-900/30 transition-colors">
        <div className="p-2 rounded-lg bg-primary-100 dark:bg-primary-900/40">
          <ChefHat className="h-5 w-5 text-primary-600" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-primary-700 dark:text-primary-300">
            <Trans>Use before they expire</Trans>
          </p>
          <div className="flex gap-1 mt-1 overflow-hidden">
            {names.map((name) => (
              <Chip key={name} size="sm" variant="flat" className="text-xs">
                {name}
              </Chip>
            ))}
            {expiringItems.length > 3 && (
              <span className="text-xs text-primary-600">+{expiringItems.length - 3}</span>
            )}
          </div>
        </div>
        <ChevronRight className="h-5 w-5 text-primary-400 shrink-0" />
      </div>
    </Link>
  );
};
