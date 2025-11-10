"use client";

import { Button, Card, CardBody, CardHeader, Input, Textarea } from "@heroui/react";
import { useLingui } from "@lingui/react/macro";
import { Trans } from "@lingui/react/macro";
import { Plus, X } from "lucide-react";
import type { CreateRecipePayload } from "../../Domain/Schemas/Recipe.schema";

interface RecipeStepsStepProps {
  steps: CreateRecipePayload["steps"];
  onAddStep: () => void;
  onRemoveStep: (index: number) => void;
  onUpdateStep: (index: number, field: string, value: any) => void;
}

export const RecipeStepsStep = ({ steps, onAddStep, onRemoveStep, onUpdateStep }: RecipeStepsStepProps) => {
  const { t } = useLingui();

  return (
    <Card>
      <CardHeader className="flex justify-between items-center border-b border-divider bg-gray-50 dark:bg-gray-900 p-4 sm:p-6">
        <h2 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-gray-100">
          <Trans>Preparation Steps</Trans>
        </h2>
        <Button
          color="success"
          variant="flat"
          startContent={<Plus className="w-4 h-4" />}
          onPress={onAddStep}
          size="sm"
        >
          <Trans>Add</Trans>
        </Button>
      </CardHeader>
      <CardBody className="p-4 sm:p-6">
        <div className="space-y-6">
          {steps.map((step, index) => (
            <div key={index} className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-start">
              <div className="flex-shrink-0 w-10 h-10 bg-primary text-primary-foreground rounded-full flex items-center justify-center font-semibold">
                {step.stepNumber}
              </div>
              <Textarea
                value={step.description}
                onValueChange={(value) => onUpdateStep(index, "description", value)}
                isRequired
                placeholder={t`Describe this step...`}
                variant="bordered"
                minRows={2}
                className="flex-1"
              />
              <Input
                type="number"
                value={step.duration?.toString() || ""}
                onValueChange={(value) =>
                  onUpdateStep(index, "duration", value ? Number.parseInt(value) : null)
                }
                min={1}
                placeholder={t`min`}
                variant="bordered"
                className="w-24"
              />
              {steps.length > 1 && (
                <Button isIconOnly color="danger" variant="light" onPress={() => onRemoveStep(index)}>
                  <X className="w-4 h-4" />
                </Button>
              )}
            </div>
          ))}
        </div>
      </CardBody>
    </Card>
  );
};
