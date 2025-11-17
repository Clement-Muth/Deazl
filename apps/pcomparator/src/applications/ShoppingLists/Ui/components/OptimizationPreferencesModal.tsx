"use client";

import { Modal, ModalBody, ModalContent, ModalFooter, ModalHeader } from "@heroui/modal";
import { Button, addToast } from "@heroui/react";
import { Slider } from "@heroui/slider";
import { Trans, useLingui } from "@lingui/react/macro";
import { Info, RotateCcw, Sparkles } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import {
  getUserOptimizationPreferences,
  resetOptimizationPreferences,
  updateUserOptimizationPreferences
} from "../../Api/preferences/optimizationPreferences.api";
import type { OptimizationPreferences } from "../../Domain/ValueObjects/OptimizationPreferences.vo";

interface OptimizationPreferencesModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPreferencesUpdated?: () => void;
}

export function OptimizationPreferencesModal({
  isOpen,
  onClose,
  onPreferencesUpdated
}: OptimizationPreferencesModalProps) {
  const { t } = useLingui();
  const [preferences, setPreferences] = useState<OptimizationPreferences | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // Charger les préférences
  useEffect(() => {
    if (isOpen) {
      loadPreferences();
    }
  }, [isOpen]);

  const loadPreferences = useCallback(async () => {
    setIsLoading(true);
    try {
      const prefs = await getUserOptimizationPreferences();
      setPreferences(prefs);
    } catch (error) {
      console.error("Error loading preferences:", error);
      addToast({
        title: "Error",
        description: "Unable to load preferences",
        variant: "solid",
        color: "danger"
      });
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handleWeightChange = useCallback((key: keyof OptimizationPreferences, value: number | number[]) => {
    const numValue = Array.isArray(value) ? value[0] : value;
    setPreferences((prev) => {
      if (!prev) return null;

      const newPrefs = { ...prev, [key]: numValue / 100 };

      // Normaliser automatiquement les pondérations
      const total =
        newPrefs.priceWeight! +
        newPrefs.qualityWeight! +
        newPrefs.distanceWeight! +
        newPrefs.availabilityWeight!;

      if (Math.abs(total - 1.0) > 0.001) {
        // Ajuster les autres poids proportionnellement
        const others = ["priceWeight", "qualityWeight", "distanceWeight", "availabilityWeight"].filter(
          (k) => k !== key
        );
        const othersSum = others.reduce(
          (sum, k) => sum + (newPrefs[k as keyof OptimizationPreferences] as number),
          0
        );

        if (othersSum > 0) {
          const factor = (1.0 - numValue / 100) / othersSum;
          for (const k of others) {
            (newPrefs[k as keyof OptimizationPreferences] as any) =
              ((prev[k as keyof OptimizationPreferences] as number) || 0) * factor;
          }
        }
      }

      return newPrefs;
    });
  }, []);

  const handleSave = useCallback(async () => {
    if (!preferences) return;

    setIsSaving(true);
    try {
      const result = await updateUserOptimizationPreferences(preferences);

      if (result.success) {
        addToast({
          title: t`Preferences Saved`,
          description: t`Your optimization preferences have been updated`,
          variant: "solid",
          color: "success"
        });
        onPreferencesUpdated?.();
        onClose();
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      console.error("Error saving preferences:", error);
      addToast({
        title: t`Error`,
        description: t`Unable to save preferences`,
        variant: "solid",
        color: "danger"
      });
    } finally {
      setIsSaving(false);
    }
  }, [preferences, onClose, onPreferencesUpdated]);

  const handleReset = useCallback(async () => {
    try {
      const result = await resetOptimizationPreferences();
      if (result.success && result.preferences) {
        setPreferences(result.preferences);
        addToast({
          title: t`Preferences Reset`,
          description: t`Default values have been restored`,
          variant: "solid",
          color: "success"
        });
      }
    } catch (error) {
      console.error("Error resetting preferences:", error);
      addToast({
        title: t`Error`,
        description: t`Unable to reset preferences`,
        variant: "solid",
        color: "danger"
      });
    }
  }, []);

  if (!preferences) {
    return null;
  }

  const totalWeight =
    (preferences.priceWeight || 0) +
    (preferences.qualityWeight || 0) +
    (preferences.distanceWeight || 0) +
    (preferences.availabilityWeight || 0);

  const isNormalized = Math.abs(totalWeight - 1.0) < 0.01;

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="2xl" scrollBehavior="inside">
      <ModalContent>
        {(onCloseModal) => (
          <>
            <ModalHeader className="flex gap-2 items-center">
              <Sparkles className="w-5 h-5" />
              <Trans>Optimization Preferences</Trans>
            </ModalHeader>

            <ModalBody>
              {isLoading ? (
                <div className="flex justify-center p-8">
                  <Trans>Loading...</Trans>
                </div>
              ) : (
                <div className="space-y-6">
                  {/* Info */}
                  <div className="flex gap-2 p-3 bg-primary-50 dark:bg-primary-900/20 rounded-lg">
                    <Info className="w-5 h-5 text-primary-600 dark:text-primary-400 flex-shrink-0 mt-0.5" />
                    <p className="text-sm text-primary-900 dark:text-primary-100">
                      <Trans>
                        Adjust the importance of each criterion to customize the optimization algorithm.
                        Weights are automatically normalized.
                      </Trans>
                    </p>
                  </div>

                  {/* Prix */}
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="font-medium">
                        💰 <Trans>Price</Trans>
                      </span>
                      <span className="text-sm text-default-500">
                        {Math.round((preferences.priceWeight || 0) * 100)}%
                      </span>
                    </div>
                    <Slider
                      size="sm"
                      step={1}
                      minValue={0}
                      maxValue={100}
                      value={[(preferences.priceWeight || 0) * 100]}
                      onChange={(value) => handleWeightChange("priceWeight", value)}
                      className="max-w-full"
                      color="primary"
                    />
                    <p className="text-xs text-default-400">
                      <Trans>Importance of the best price</Trans>
                    </p>
                  </div>

                  {/* Qualité */}
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="font-medium">
                        🌱 <Trans>Quality</Trans>
                      </span>
                      <span className="text-sm text-default-500">
                        {Math.round((preferences.qualityWeight || 0) * 100)}%
                      </span>
                    </div>
                    <Slider
                      size="sm"
                      step={1}
                      minValue={0}
                      maxValue={100}
                      value={[(preferences.qualityWeight || 0) * 100]}
                      onChange={(value) => handleWeightChange("qualityWeight", value)}
                      className="max-w-full"
                      color="success"
                    />
                    <p className="text-xs text-default-400">
                      <Trans>Importance of nutritional and environmental quality</Trans>
                    </p>
                  </div>

                  {/* Distance */}
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="font-medium">
                        📍 <Trans>Proximity</Trans>
                      </span>
                      <span className="text-sm text-default-500">
                        {Math.round((preferences.distanceWeight || 0) * 100)}%
                      </span>
                    </div>
                    <Slider
                      size="sm"
                      step={1}
                      minValue={0}
                      maxValue={100}
                      value={[(preferences.distanceWeight || 0) * 100]}
                      onChange={(value) => handleWeightChange("distanceWeight", value)}
                      className="max-w-full"
                      color="warning"
                    />
                    <p className="text-xs text-default-400">
                      <Trans>Importance of store proximity</Trans>
                    </p>
                  </div>

                  {/* Disponibilité */}
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="font-medium">
                        ✅ <Trans>Availability</Trans>
                      </span>
                      <span className="text-sm text-default-500">
                        {Math.round((preferences.availabilityWeight || 0) * 100)}%
                      </span>
                    </div>
                    <Slider
                      size="sm"
                      step={1}
                      minValue={0}
                      maxValue={100}
                      value={[(preferences.availabilityWeight || 0) * 100]}
                      onChange={(value) => handleWeightChange("availabilityWeight", value)}
                      className="max-w-full"
                      color="secondary"
                    />
                    <p className="text-xs text-default-400">
                      <Trans>Importance of stock availability</Trans>
                    </p>
                  </div>

                  {/* Total */}
                  <div className="pt-4 border-t border-divider">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">
                        <Trans>Total</Trans>
                      </span>
                      <span
                        className={`text-sm font-bold ${isNormalized ? "text-success-600" : "text-warning-600"}`}
                      >
                        {Math.round(totalWeight * 100)}%
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </ModalBody>

            <ModalFooter>
              <Button variant="light" onPress={handleReset} startContent={<RotateCcw className="w-4 h-4" />}>
                <Trans>Reset</Trans>
              </Button>
              <Button variant="light" onPress={onCloseModal}>
                <Trans>Cancel</Trans>
              </Button>
              <Button color="primary" onPress={handleSave} isLoading={isSaving} isDisabled={!isNormalized}>
                <Trans>Save</Trans>
              </Button>
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  );
}
