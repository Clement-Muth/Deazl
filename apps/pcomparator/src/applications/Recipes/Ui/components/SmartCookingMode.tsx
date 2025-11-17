"use client";
import { useDisclosure } from "@heroui/react";
import { Package } from "lucide-react";
import { useRouter } from "next/navigation";
import { FloatingButton } from "~/components/Button/FloatingButton/FloatingButton";
import { useCookingSession } from "../hooks/useCookingSession";
import { CookingCompletionScreen } from "./CookingCompletionScreen";
import { CookingModeHeader } from "./CookingModeHeader";
import { CookingStepScreen } from "./CookingStepScreen";
import { IngredientsModal } from "./IngredientsModal";

interface RecipeStep {
  id: string;
  description: string;
  duration?: number;
}

interface RecipeIngredient {
  id: string;
  productName: string;
  quantity: number;
  unit: string;
}

interface SmartCookingModeProps {
  recipeId: string;
  recipeName: string;
  steps: RecipeStep[];
  ingredients: RecipeIngredient[];
}

export function SmartCookingMode({ recipeId, recipeName, steps, ingredients }: SmartCookingModeProps) {
  const router = useRouter();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const { currentStepIndex, nextStep, previousStep, clearSession, restartSession, isCompleted, progress } =
    useCookingSession(recipeId, steps.length);

  const currentStep = steps[currentStepIndex];

  const handleBack = () => {
    clearSession();
    router.back();
  };

  const handleFinish = () => {
    clearSession();
    router.back();
  };

  const handleRestart = () => {
    restartSession();
  };

  if (isCompleted) {
    return (
      <div className="fixed inset-0 bg-gray-50 dark:bg-gray-900 overflow-hidden">
        <CookingModeHeader
          currentStep={steps.length}
          totalSteps={steps.length}
          progress={100}
          onBack={handleBack}
        />

        <div className="h-full pb-8">
          <CookingCompletionScreen
            recipeName={recipeName}
            totalSteps={steps.length}
            onFinish={handleFinish}
            onRestart={handleRestart}
          />
        </div>
      </div>
    );
  }

  return (
    <div>
      <CookingModeHeader
        currentStep={currentStepIndex}
        totalSteps={steps.length}
        progress={progress}
        onBack={handleBack}
      />

      <FloatingButton icon={<Package size={24} />} onPress={onOpen} />

      <IngredientsModal
        isOpen={isOpen}
        onClose={onClose}
        ingredients={ingredients}
        currentStepDescription={currentStep?.description}
      />

      <div className="h-full overflow-hidden">
        <div
          className="flex h-full transition-transform duration-300 ease-in-out w-dvw"
          style={{ transform: `translateX(-${currentStepIndex * 100}%)` }}
        >
          {steps.map((step, index) => (
            <div key={step.id} className="flex-shrink-0 w-full h-full px-4 flex items-center">
              <CookingStepScreen
                step={step}
                stepNumber={index + 1}
                totalSteps={steps.length}
                onNext={nextStep}
                onPrevious={previousStep}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
