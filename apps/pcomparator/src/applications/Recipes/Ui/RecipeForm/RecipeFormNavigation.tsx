"use client";

import { Button, Card, CardFooter } from "@heroui/react";
import { Trans } from "@lingui/react/macro";
import { ArrowLeft, ArrowRight, Check } from "lucide-react";

interface RecipeFormNavigationProps {
  currentStep: 1 | 2 | 3;
  canGoToNextStep: boolean;
  isSubmitting: boolean;
  onPrevStep: () => void;
  onNextStep: () => void;
  cancelUrl: string;
  submitButtonText: string;
  submittingText: string;
}

export const RecipeFormNavigation = ({
  currentStep,
  canGoToNextStep,
  isSubmitting,
  onPrevStep,
  onNextStep,
  cancelUrl,
  submitButtonText,
  submittingText
}: RecipeFormNavigationProps) => {
  return (
    <Card>
      <CardFooter className="border-t border-divider bg-gray-50 dark:bg-gray-900 p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 w-full">
          {currentStep > 1 && (
            <Button
              onPress={onPrevStep}
              startContent={<ArrowLeft className="w-4 h-4" />}
              size="lg"
              className="w-full sm:w-auto"
            >
              <Trans>Previous</Trans>
            </Button>
          )}

          {currentStep < 3 ? (
            <Button
              color="primary"
              onPress={onNextStep}
              endContent={<ArrowRight className="w-4 h-4" />}
              isDisabled={!canGoToNextStep}
              className="w-full"
              size="lg"
            >
              <Trans>Next</Trans>
            </Button>
          ) : (
            <Button
              color="primary"
              isLoading={isSubmitting}
              onPress={(e) => {
                // Trigger form submission via the parent form
                const form = (e.target as HTMLElement).closest("form");
                if (form) {
                  form.requestSubmit();
                }
              }}
              endContent={<Check className="w-4 h-4" />}
              className="w-full"
              size="lg"
            >
              {isSubmitting ? submittingText : submitButtonText}
            </Button>
          )}

          <Button as="a" href={cancelUrl} variant="light" size="lg" className="w-full sm:w-auto">
            <Trans>Cancel</Trans>
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
};
