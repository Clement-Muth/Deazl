"use client";

import { Button, Card, CardBody, Checkbox, Chip } from "@heroui/react";
import { Trans, useLingui } from "@lingui/react/macro";
import { motion } from "framer-motion";
import {
  Check,
  ChevronLeft,
  ChevronRight,
  Clock,
  Flame,
  Pause,
  Play,
  RotateCcw,
  Sparkles
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { formatTime, useTimer } from "../hooks/useTimer";

interface Step {
  id: string;
  stepNumber: number;
  description: string;
  duration?: number | null;
}

interface StepProgress {
  [stepId: string]: boolean;
}

interface RecipeDetailsMobilePreparationProps {
  recipe: {
    id: string;
    steps?: Step[];
  };
  stepByStepMode: boolean;
  setStepByStepMode: (mode: boolean) => void;
  currentStep: number;
  setCurrentStep: (step: number) => void;
  stepsCompleted: StepProgress;
  toggleStepCompletion: (stepId: string) => void;
  goToNextStep: () => void;
  goToPreviousStep: () => void;
}

export default function RecipeDetailsMobilePreparation({
  recipe,
  stepByStepMode,
  setStepByStepMode,
  currentStep,
  setCurrentStep,
  stepsCompleted,
  toggleStepCompletion,
  goToNextStep,
  goToPreviousStep
}: RecipeDetailsMobilePreparationProps) {
  const { t } = useLingui();
  const router = useRouter();

  // Timer pour l'étape actuelle
  const currentStepDuration = recipe.steps?.[currentStep]?.duration
    ? recipe.steps[currentStep].duration * 60
    : 0;
  const timer = useTimer(currentStepDuration);

  // Update timer duration when step changes
  useEffect(() => {
    if (recipe.steps?.[currentStep]?.duration) {
      timer.setDuration(recipe.steps[currentStep].duration * 60);
    } else {
      timer.setDuration(0);
    }
  }, [currentStep, recipe.steps]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.3 }}
    >
      <Card>
        <CardBody className="p-5">
          {/* Header avec toggle step-by-step - Design moderne */}
          <div className="flex items-start justify-between mb-5">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-warning/10 flex items-center justify-center">
                <Flame className="w-6 h-6 text-warning" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                  <Trans>Préparation</Trans>
                </h2>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {recipe.steps?.length || 0} <Trans>étapes</Trans>
                </p>
              </div>
            </div>

            <Button
              size="md"
              variant="shadow"
              color="success"
              startContent={<Sparkles className="w-4 h-4" />}
              onPress={() => router.push(`/recipes/${recipe.id}/cook`)}
              className="font-semibold hover:scale-105 transition-transform"
            >
              <Trans>Mode Cuisine</Trans>
            </Button>
          </div>

          {/* Toggle mode */}
          <div className="mb-5 flex items-center justify-center gap-2 p-1.5 bg-default-100 dark:bg-default-50/5 rounded-xl">
            <Button
              size="md"
              variant={!stepByStepMode ? "solid" : "light"}
              color={!stepByStepMode ? "primary" : "default"}
              onPress={() => setStepByStepMode(false)}
              className="flex-1 font-medium transition-all"
            >
              <Trans>Liste complète</Trans>
            </Button>
            <Button
              size="md"
              variant={stepByStepMode ? "solid" : "light"}
              color={stepByStepMode ? "primary" : "default"}
              onPress={() => setStepByStepMode(true)}
              className="flex-1 font-medium transition-all"
            >
              <Trans>Étape par étape</Trans>
            </Button>
          </div>

          {/* Mode step-by-step - Design moderne */}
          {stepByStepMode && recipe.steps && recipe.steps.length > 0 ? (
            <div className="space-y-5">
              {/* Indicateur progression - Design moderne */}
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Chip size="md" color="primary" variant="flat" className="font-bold">
                    {currentStep + 1} / {recipe.steps.length}
                  </Chip>
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    <Trans>Étape actuelle</Trans>
                  </span>
                </div>
                <Chip size="sm" color="success" variant="dot" className="font-medium">
                  {Object.values(stepsCompleted).filter(Boolean).length} <Trans>terminées</Trans>
                </Chip>
              </div>

              {/* Barre de progression - Design moderne */}
              <div className="relative h-2 bg-default-100 dark:bg-default-50/5 rounded-full overflow-hidden">
                <motion.div
                  className="absolute inset-y-0 left-0 bg-linear-to-r from-primary to-primary-400 rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${((currentStep + 1) / recipe.steps.length) * 100}%` }}
                  transition={{ duration: 0.5, ease: "easeOut" }}
                />
              </div>

              {/* Étape actuelle - Card moderne */}
              <motion.div
                key={currentStep}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
                className="p-5 bg-linear-to-br from-primary/5 to-primary/10 rounded-2xl border-2 border-primary/20 shadow-sm"
              >
                <div className="flex items-start gap-4">
                  <div className="shrink-0 w-12 h-12 bg-primary text-primary-foreground rounded-2xl flex items-center justify-center font-bold text-xl shadow-lg shadow-primary/30">
                    {recipe.steps[currentStep].stepNumber}
                  </div>
                  <div className="flex-1">
                    <p className="text-base leading-relaxed text-gray-900 dark:text-gray-100 mb-4 font-medium">
                      {recipe.steps[currentStep].description}
                    </p>

                    {/* Timer controls - Design moderne */}
                    {recipe.steps[currentStep].duration && recipe.steps[currentStep].duration > 0 && (
                      <div className="space-y-3">
                        <div className="relative">
                          <div
                            className={`text-center py-4 px-6 rounded-2xl font-mono text-3xl font-bold transition-all duration-300 ${
                              timer.isFinished
                                ? "bg-linear-to-br from-success to-success-600 text-white shadow-lg shadow-success/30"
                                : timer.isRunning
                                  ? "bg-linear-to-br from-primary to-primary-600 text-white shadow-lg shadow-primary/30 animate-pulse"
                                  : "bg-default-100 dark:bg-default-50/5 text-gray-900 dark:text-gray-100"
                            }`}
                          >
                            {timer.isFinished ? (
                              <div className="flex items-center justify-center gap-2">
                                <Check className="w-8 h-8" />
                                <span>Terminé !</span>
                              </div>
                            ) : (
                              formatTime(timer.timeLeft)
                            )}
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <Button
                            size="lg"
                            color="primary"
                            variant={timer.isRunning ? "flat" : "shadow"}
                            onPress={timer.isRunning ? timer.pause : timer.start}
                            isDisabled={timer.timeLeft === 0}
                            startContent={
                              timer.isRunning ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />
                            }
                            className="flex-1 font-semibold hover:scale-105 transition-transform"
                          >
                            {timer.isRunning ? t`Pause` : t`Démarrer`}
                          </Button>
                          <Button
                            size="lg"
                            variant="flat"
                            onPress={timer.reset}
                            isIconOnly
                            className="hover:scale-110 transition-transform"
                          >
                            <RotateCcw className="w-5 h-5" />
                          </Button>
                        </div>

                        <p className="text-sm text-gray-600 dark:text-gray-400 text-center flex items-center justify-center gap-2">
                          <Clock className="w-4 h-4" />
                          <Trans>Durée:</Trans> {recipe.steps[currentStep].duration} min
                        </p>
                      </div>
                    )}

                    {!recipe.steps[currentStep].duration && (
                      <Chip
                        size="md"
                        variant="flat"
                        color="default"
                        startContent={<Clock className="w-4 h-4" />}
                      >
                        <Trans>Pas de minuteur pour cette étape</Trans>
                      </Chip>
                    )}
                  </div>
                </div>
              </motion.div>

              {/* Navigation */}
              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  variant="flat"
                  isDisabled={currentStep === 0}
                  onPress={goToPreviousStep}
                  startContent={<ChevronLeft className="w-4 h-4" />}
                  className="flex-1"
                >
                  <Trans>Précédent</Trans>
                </Button>
                <Button
                  size="sm"
                  color={recipe.steps && stepsCompleted[recipe.steps[currentStep].id] ? "default" : "success"}
                  variant={recipe.steps && stepsCompleted[recipe.steps[currentStep].id] ? "flat" : "solid"}
                  onPress={() => recipe.steps && toggleStepCompletion(recipe.steps[currentStep].id)}
                  startContent={
                    recipe.steps && stepsCompleted[recipe.steps[currentStep].id] ? (
                      <Check className="w-4 h-4" />
                    ) : undefined
                  }
                >
                  {recipe.steps && stepsCompleted[recipe.steps[currentStep].id]
                    ? t`Fait`
                    : t`Marquer terminé`}
                </Button>
                <Button
                  size="sm"
                  variant="flat"
                  isDisabled={currentStep === recipe.steps.length - 1}
                  onPress={goToNextStep}
                  endContent={<ChevronRight className="w-4 h-4" />}
                  className="flex-1"
                >
                  <Trans>Suivant</Trans>
                </Button>
              </div>
            </div>
          ) : (
            /* Mode liste complète avec checklist */
            <div className="space-y-3">
              {recipe.steps?.map((step, index) => (
                <div
                  key={step.id}
                  className={`flex gap-3 p-3 rounded-lg border transition-colors ${
                    stepsCompleted[step.id]
                      ? "bg-success/10 border-success/20"
                      : "bg-gray-50 dark:bg-gray-800 border-transparent hover:border-primary/20"
                  }`}
                >
                  <Checkbox
                    isSelected={stepsCompleted[step.id]}
                    onValueChange={() => toggleStepCompletion(step.id)}
                    size="md"
                    color="success"
                  />
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <div className="shrink-0 w-7 h-7 bg-primary text-primary-foreground rounded-full flex items-center justify-center font-bold text-sm">
                        {step.stepNumber}
                      </div>
                      {step.duration && (
                        <Chip
                          size="sm"
                          variant="flat"
                          color="primary"
                          startContent={<Clock className="w-3 h-3" />}
                          className="text-xs"
                        >
                          {step.duration} min
                        </Chip>
                      )}
                    </div>
                    <p
                      className={`text-sm leading-relaxed ${
                        stepsCompleted[step.id]
                          ? "line-through text-gray-500"
                          : "text-gray-700 dark:text-gray-300"
                      }`}
                    >
                      {step.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardBody>
      </Card>
    </motion.div>
  );
}
