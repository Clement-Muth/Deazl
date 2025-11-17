import { Trans } from "@lingui/react/macro";
import type { ReactNode } from "react";

export interface StepperProps {
  steps: { label: ReactNode | string; completed?: boolean; active?: boolean }[];
  currentStep: number;
  size?: "sm" | "md" | "lg" | "xl";
}

export const Stepper = ({ currentStep, steps, size = "md" }: StepperProps) => {
  const totalSteps = steps.length;
  const progress = (currentStep / totalSteps) * 100;

  const sizes = {
    sm: { svgSize: 56, radius: 24, strokeWidth: 4, fontSize: "text-xs" },
    md: { svgSize: 64, radius: 29, strokeWidth: 5, fontSize: "text-sm" },
    lg: { svgSize: 72, radius: 33, strokeWidth: 5, fontSize: "text-base" },
    xl: { svgSize: 86, radius: 40, strokeWidth: 6, fontSize: "text-lg" }
  };

  const { svgSize, radius, strokeWidth, fontSize } = sizes[size];
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (progress / 100) * circumference;

  return (
    <div className="flex items-center gap-x-4 w-full justify-between mt-4">
      <div className="relative">
        <svg width={svgSize} height={svgSize} data-testid="stepper-svg" viewBox={`0 0 ${svgSize} ${svgSize}`}>
          <title>Step</title>
          <circle
            className="text-gray-300"
            data-testid="back"
            strokeWidth={strokeWidth}
            stroke="currentColor"
            fill="transparent"
            r={radius}
            cx={svgSize / 2}
            cy={svgSize / 2}
          />
          <circle
            className="text-primary-300 transition-all duration-300 -rotate-90 origin-center"
            data-testid="progression"
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
            stroke="currentColor"
            fill="transparent"
            r={radius}
            cx={svgSize / 2}
            cy={svgSize / 2}
          />
        </svg>
        <div className={`absolute inset-0 flex items-center justify-center font-semibold ${fontSize}`}>
          {currentStep} of {totalSteps}
        </div>
      </div>

      <div className="text-right">
        <h2 className="font-semibold text-xl">{steps[currentStep - 1].label}</h2>
        <p className="text-gray-500 text-small">
          Next: {steps.at(currentStep)?.label ?? <Trans>Done</Trans>}
        </p>
      </div>
    </div>
  );
};
