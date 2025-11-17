import { Button } from "@heroui/react";
import { Trans } from "@lingui/react/macro";
import { ArchiveIcon, ListPlusIcon, ShoppingCartIcon } from "lucide-react";

export interface EmptyStateProps {
  type: "active" | "completed";
  onCreateList?: () => void;
}

export const EmptyState = ({ type, onCreateList }: EmptyStateProps) => (
  <div className="text-center py-16 px-4">
    <div className="bg-gradient-to-br from-primary-50 to-primary-100 dark:from-primary-900/20 dark:to-primary-800/20 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
      {type === "active" ? (
        <ShoppingCartIcon className="h-10 w-10 text-primary-600 dark:text-primary-400" />
      ) : (
        <ArchiveIcon className="h-10 w-10 text-gray-600 dark:text-gray-400" />
      )}
    </div>
    <h3 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
      {type === "active" ? <Trans>No active shopping lists</Trans> : <Trans>No completed lists</Trans>}
    </h3>
    <p className="text-sm md:text-base text-gray-600 dark:text-gray-400 mb-8 max-w-md mx-auto">
      {type === "active" ? (
        <Trans>
          Start organizing your shopping by creating your first list. Add items, track prices, and never
          forget what you need to buy!
        </Trans>
      ) : (
        <Trans>Once you complete a shopping list, it will appear here for your reference.</Trans>
      )}
    </p>
    {type === "active" && onCreateList && (
      <Button
        color="primary"
        size="lg"
        startContent={<ListPlusIcon className="h-5 w-5" />}
        onPress={onCreateList}
        className="font-semibold"
      >
        <Trans>Create Your First List</Trans>
      </Button>
    )}
  </div>
);
