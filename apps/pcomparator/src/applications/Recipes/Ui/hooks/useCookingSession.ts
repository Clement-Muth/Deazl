"use client";

import { useEffect, useState } from "react";

interface CookingSessionState {
  recipeId: string;
  currentStepIndex: number;
}

const STORAGE_KEY = "cooking-session";

export function useCookingSession(recipeId: string, totalSteps: number) {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        const session: CookingSessionState = JSON.parse(stored);
        if (session.recipeId === recipeId) {
          setCurrentStepIndex(session.currentStepIndex);
        }
      } catch (error) {
        console.error("Failed to restore cooking session:", error);
      }
    }
  }, [recipeId]);

  const saveSession = (stepIndex: number) => {
    const session: CookingSessionState = {
      recipeId,
      currentStepIndex: stepIndex
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
  };

  const nextStep = () => {
    if (currentStepIndex < totalSteps) {
      const newIndex = currentStepIndex + 1;
      setCurrentStepIndex(newIndex);
      saveSession(newIndex);
    }
  };

  const previousStep = () => {
    if (currentStepIndex > 0) {
      const newIndex = currentStepIndex - 1;
      setCurrentStepIndex(newIndex);
      saveSession(newIndex);
    }
  };

  const clearSession = () => {
    localStorage.removeItem(STORAGE_KEY);
    setCurrentStepIndex(0);
  };

  const restartSession = () => {
    setCurrentStepIndex(0);
    saveSession(0);
  };

  return {
    currentStepIndex,
    nextStep,
    previousStep,
    clearSession,
    restartSession,
    isFirstStep: currentStepIndex === 0,
    isLastStep: currentStepIndex === totalSteps - 1,
    isCompleted: currentStepIndex >= totalSteps,
    progress: totalSteps > 0 ? ((currentStepIndex + 1) / totalSteps) * 100 : 0
  };
}
