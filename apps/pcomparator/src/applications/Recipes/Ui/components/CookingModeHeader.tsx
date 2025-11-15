"use client";

import { Button } from "@heroui/react";
import { Trans } from "@lingui/react/macro";
import { ChevronLeft } from "lucide-react";

interface CookingModeHeaderProps {
  currentStep: number;
  totalSteps: number;
  progress: number;
  onBack: () => void;
}

export function CookingModeHeader({ currentStep, totalSteps, progress, onBack }: CookingModeHeaderProps) {
  return (
    <div className="z-50 bg-white dark:bg-gray-800 border-b border-divider shadow-sm">
      <div className="flex items-center justify-between px-4 py-3">
        <Button isIconOnly variant="light" onPress={onBack} size="sm">
          <ChevronLeft className="w-5 h-5" />
        </Button>

        <div className="flex-1 mx-4">
          <div className="text-sm font-medium mb-1 text-center text-gray-700 dark:text-gray-300">
            <Trans>
              Step {currentStep + 1} / {totalSteps}
            </Trans>
          </div>
          <div className="h-2 rounded-full overflow-hidden bg-gray-200 dark:bg-gray-700">
            <div
              className="h-full bg-primary transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
