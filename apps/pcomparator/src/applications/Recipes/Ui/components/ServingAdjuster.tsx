"use client";

import { Button, Card, CardBody, Chip } from "@heroui/react";
import { Trans, useLingui } from "@lingui/react/macro";
import { Minus, Plus, RotateCcw, Users } from "lucide-react";
import { useCallback, useState } from "react";

interface ServingAdjusterProps {
  defaultServings: number;
  onServingsChange: (newServings: number, scaleFactor: number) => void;
}

export function ServingAdjuster({ defaultServings, onServingsChange }: ServingAdjusterProps) {
  const { t } = useLingui();
  const [servings, setServings] = useState(defaultServings);
  const minServings = 1;
  const maxServings = 50;

  const scaleFactor = servings / defaultServings;

  const handleDecrease = useCallback(() => {
    if (servings > minServings) {
      const newServings = servings - 1;
      setServings(newServings);
      onServingsChange(newServings, newServings / defaultServings);
    }
  }, [servings, defaultServings, onServingsChange]);

  const handleIncrease = useCallback(() => {
    if (servings < maxServings) {
      const newServings = servings + 1;
      setServings(newServings);
      onServingsChange(newServings, newServings / defaultServings);
    }
  }, [servings, defaultServings, onServingsChange]);

  const handleReset = useCallback(() => {
    setServings(defaultServings);
    onServingsChange(defaultServings, 1);
  }, [defaultServings, onServingsChange]);

  const isModified = servings !== defaultServings;

  return (
    <Card shadow="none" className="bg-content2 border-none">
      <CardBody className="p-4">
        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                <Users className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-sm font-semibold text-foreground">
                  <Trans>Servings</Trans>
                </p>
                {isModified && (
                  <p className="text-xs text-default-400">
                    <Trans>Original: {defaultServings}</Trans>
                  </p>
                )}
              </div>
            </div>
            {isModified && (
              <Button
                size="sm"
                variant="light"
                color="default"
                onPress={handleReset}
                aria-label={t`Reset to original`}
                startContent={<RotateCcw className="w-3.5 h-3.5" />}
                className="text-xs"
              >
                <Trans>Reset</Trans>
              </Button>
            )}
          </div>

          <div className="flex items-center justify-center gap-4">
            <Button
              isIconOnly
              size="lg"
              variant="flat"
              color="primary"
              onPress={handleDecrease}
              isDisabled={servings <= minServings}
              aria-label={t`Decrease servings`}
              className="w-12 h-12 min-w-12 touch-manipulation"
            >
              <Minus className="w-5 h-5" />
            </Button>

            <Chip
              size="lg"
              color={isModified ? "primary" : "default"}
              variant={isModified ? "solid" : "flat"}
              className="min-w-16 h-12 text-xl font-bold justify-center"
            >
              {servings}
            </Chip>

            <Button
              isIconOnly
              size="lg"
              variant="flat"
              color="primary"
              onPress={handleIncrease}
              isDisabled={servings >= maxServings}
              aria-label={t`Increase servings`}
              className="w-12 h-12 min-w-12 touch-manipulation"
            >
              <Plus className="w-5 h-5" />
            </Button>
          </div>

          {isModified && (
            <p className="text-xs text-center text-primary font-medium">
              <Trans>
                Quantities adjusted by {scaleFactor > 1 ? "+" : ""}
                {Math.round((scaleFactor - 1) * 100)}%
              </Trans>
            </p>
          )}
        </div>
      </CardBody>
    </Card>
  );
}
