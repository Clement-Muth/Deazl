"use client";

import { Modal, ModalBody, ModalContent, ModalFooter, ModalHeader } from "@heroui/modal";
import { Button, addToast } from "@heroui/react";
import { Slider } from "@heroui/slider";
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
  const [preferences, setPreferences] = useState<OptimizationPreferences | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

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
        title: "Erreur",
        description: "Impossible de charger les préférences",
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
      return { ...prev, [key]: numValue / 100 };
    });
  }, []);

  const handleSave = useCallback(async () => {
    if (!preferences) return;

    setIsSaving(true);
    try {
      const result = await updateUserOptimizationPreferences(preferences);

      if (result.success) {
        addToast({
          title: "Préférences sauvegardées",
          description: "Vos préférences d'optimisation ont été mises à jour",
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
        title: "Erreur",
        description: "Impossible de sauvegarder les préférences",
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
          title: "Préférences réinitialisées",
          description: "Les valeurs par défaut ont été restaurées",
          variant: "solid",
          color: "success"
        });
      }
    } catch (error) {
      console.error("Error resetting preferences:", error);
      addToast({
        title: "Erreur",
        description: "Impossible de réinitialiser les préférences",
        variant: "solid",
        color: "danger"
      });
    }
  }, []);

  if (!preferences) {
    return null;
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="2xl" scrollBehavior="inside">
      <ModalContent>
        {(onCloseModal) => (
          <>
            <ModalHeader className="flex gap-2 items-center">
              <Sparkles className="w-5 h-5" />
              Préférences d'optimisation
            </ModalHeader>

            <ModalBody>
              {isLoading ? (
                <div className="flex justify-center p-8">Chargement...</div>
              ) : (
                <div className="space-y-6">
                  <div className="flex gap-2 p-3 bg-primary-50 dark:bg-primary-900/20 rounded-lg">
                    <Info className="w-5 h-5 text-primary-600 dark:text-primary-400 flex-shrink-0 mt-0.5" />
                    <p className="text-sm text-primary-900 dark:text-primary-100">
                      Ajustez l'importance de chaque critère pour personnaliser l'algorithme d'optimisation.
                    </p>
                  </div>

                  {/* Prix */}
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="font-medium">💰 Prix</span>
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
                  </div>

                  {/* Qualité */}
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="font-medium">🌱 Qualité</span>
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
                  </div>

                  {/* Distance */}
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="font-medium">📍 Proximité</span>
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
                  </div>

                  {/* Disponibilité */}
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="font-medium">✅ Disponibilité</span>
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
                  </div>
                </div>
              )}
            </ModalBody>

            <ModalFooter>
              <Button variant="light" onPress={handleReset} startContent={<RotateCcw className="w-4 h-4" />}>
                Réinitialiser
              </Button>
              <Button variant="light" onPress={onCloseModal}>
                Annuler
              </Button>
              <Button color="primary" onPress={handleSave} isLoading={isSaving}>
                Sauvegarder
              </Button>
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  );
}
