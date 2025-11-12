"use client";

import { Button, Chip } from "@heroui/react";
import { GitCompareIcon, XIcon } from "lucide-react";

interface ComparisonFloatingButtonProps {
  selectedCount: number;
  maxCount: number;
  onOpenComparison: () => void;
  onClearSelection: () => void;
}

export const ComparisonFloatingButton = ({
  selectedCount,
  maxCount,
  onOpenComparison,
  onClearSelection
}: ComparisonFloatingButtonProps) => {
  if (selectedCount === 0) {
    return null;
  }

  return (
    <div className="fixed bottom-20 right-4 z-40 animate-slideUp">
      <div className="bg-white rounded-full shadow-lg border-2 border-primary-500 p-2 flex items-center gap-2">
        <Button isIconOnly size="sm" variant="light" onPress={onClearSelection} className="min-w-0 h-8 w-8">
          <XIcon className="h-4 w-4" />
        </Button>

        <Chip size="lg" color="primary" variant="solid" className="font-bold">
          {selectedCount}/{maxCount}
        </Chip>

        <Button
          size="lg"
          color="primary"
          variant="solid"
          startContent={<GitCompareIcon className="h-5 w-5" />}
          onPress={onOpenComparison}
          isDisabled={selectedCount < 2}
          className="font-semibold"
        >
          Comparer
        </Button>
      </div>
    </div>
  );
};
