"use client";

import { Button } from "@heroui/react";
import { Trans } from "@lingui/react/macro";
import { Sparkles } from "lucide-react";
import { useState } from "react";
import { generateRecipeDescription } from "../../Api/recipes/generateDescription.api";
import type { CreateRecipePayload } from "../../Domain/Schemas/Recipe.schema";

interface AIDescriptionButtonProps {
  formData: CreateRecipePayload;
  onDescriptionGenerated: (description: string) => void;
}

export const AIDescriptionButton = ({ formData, onDescriptionGenerated }: AIDescriptionButtonProps) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = async () => {
    if (!formData.name.trim()) {
      setError("Please enter a recipe name first");
      return;
    }

    setIsGenerating(true);
    setError(null);

    try {
      const result = await generateRecipeDescription({
        recipeName: formData.name,
        difficulty: formData.difficulty,
        preparationTime: formData.preparationTime,
        cookingTime: formData.cookingTime,
        servings: formData.servings
      });

      if (result.success) {
        onDescriptionGenerated(result.description);
      } else {
        setError(result.error);
      }
    } catch (err) {
      setError("An unexpected error occurred");
      console.error("Error generating description:", err);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="space-y-2">
      <Button
        color="secondary"
        variant="flat"
        size="sm"
        startContent={<Sparkles className="h-4 w-4" />}
        onPress={handleGenerate}
        isLoading={isGenerating}
        isDisabled={!formData.name.trim() || isGenerating}
        className="w-full sm:w-auto"
      >
        {isGenerating ? <Trans>Generating...</Trans> : <Trans>Generate with AI</Trans>}
      </Button>
      {error && <p className="text-xs text-danger">{error}</p>}
    </div>
  );
};
