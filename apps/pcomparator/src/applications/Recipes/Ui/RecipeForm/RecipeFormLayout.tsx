"use client";

import { Progress } from "@heroui/react";
import { Check } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

export interface FormStep {
  number: 1 | 2 | 3;
  title: string;
  icon: LucideIcon;
}

interface RecipeFormLayoutProps {
  title: ReactNode;
  description: ReactNode;
  steps: FormStep[];
  currentStep: 1 | 2 | 3;
  error: string | null;
  children: ReactNode;
}

export const RecipeFormLayout = ({
  title,
  description,
  steps,
  currentStep,
  error,
  children
}: RecipeFormLayoutProps) => {
  const progressPercentage = (currentStep / 3) * 100;

  return (
    <div className="w-full">
      {/* Header */}
      <div className="mb-4 sm:mb-6 pb-4 sm:pb-6 border-b border-divider">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-gray-100 mb-1 sm:mb-2">
          {title}
        </h1>
        <p className="text-sm sm:text-base text-gray-500 dark:text-gray-400">{description}</p>
      </div>

      {/* Progress Bar */}
      <div className="mb-6 sm:mb-8">
        <div className="flex items-center justify-between mb-3">
          {steps.map((step) => {
            const Icon = step.icon;
            const isCompleted = step.number < currentStep;
            const isCurrent = step.number === currentStep;

            return (
              <div key={step.number} className="flex flex-col items-center flex-1">
                <div
                  className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center transition-all ${
                    isCompleted
                      ? "bg-primary text-primary-foreground"
                      : isCurrent
                        ? "bg-primary text-primary-foreground ring-4 ring-primary-100 dark:ring-primary-900"
                        : "bg-gray-200 dark:bg-gray-700 text-gray-400 dark:text-gray-500"
                  }`}
                >
                  {isCompleted ? (
                    <Check className="w-4 h-4 sm:w-5 sm:h-5" />
                  ) : (
                    <Icon className="w-4 h-4 sm:w-5 sm:h-5" />
                  )}
                </div>
                <span
                  className={`text-xs sm:text-sm mt-2 font-medium ${
                    isCurrent
                      ? "text-primary"
                      : isCompleted
                        ? "text-gray-700 dark:text-gray-300"
                        : "text-gray-400 dark:text-gray-500"
                  }`}
                >
                  {step.title}
                </span>
              </div>
            );
          })}
        </div>
        <Progress value={progressPercentage} color="primary" className="h-2" />
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 px-4 py-3 rounded-lg mb-6 flex items-start gap-3">
          <span className="text-red-500 dark:text-red-400 font-bold">⚠️</span>
          <span>{error}</span>
        </div>
      )}

      {/* Form Content */}
      {children}
    </div>
  );
};
