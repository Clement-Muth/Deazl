"use client";

import { Button } from "@heroui/button";
import { Card, CardBody } from "@heroui/card";
import { Trans } from "@lingui/react/macro";
import { ArrowLeft } from "lucide-react";
import { useState } from "react";
import { mapIngredientsToProducts } from "../../Api/recipeBuilder/mapIngredientsToProducts.api";
import type { CreateRecipePayload } from "../../Domain/Schemas/Recipe.schema";
import { useRecipeFromPhoto } from "../../hooks/useRecipeFromPhoto";
import { PhotoCapture } from "../RecipeBuilder/PhotoImport/PhotoCapture";
import { PhotoPreview } from "../RecipeBuilder/PhotoImport/PhotoPreview";
import { RecipePreviewCard } from "../RecipeBuilder/PhotoImport/RecipePreviewCard";

interface PhotoImportStepProps {
  onRecipeExtracted: (recipe: Partial<CreateRecipePayload>) => void;
  onBack: () => void;
}

export function PhotoImportStep({ onRecipeExtracted, onBack }: PhotoImportStepProps) {
  const { isAnalyzing, error, recipe, analyzePhoto, reset } = useRecipeFromPhoto();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const handlePhotoSelected = (file: File) => {
    setSelectedFile(file);
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
  };

  const handleAnalyze = async () => {
    if (selectedFile) {
      await analyzePhoto(selectedFile);
    }
  };

  const handleRemove = () => {
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }
    setSelectedFile(null);
    setPreviewUrl(null);
    reset();
  };

  const handleUseRecipe = async () => {
    if (recipe) {
      // Map ingredients to database products
      let mappedIngredients: CreateRecipePayload["ingredients"] = [];

      if (recipe.ingredients && recipe.ingredients.length > 0) {
        const mappingResult = await mapIngredientsToProducts({
          ingredients: recipe.ingredients.map((ing) => ({
            productName: ing.productName,
            quantity: ing.quantity,
            unit: ing.unit
          }))
        });

        if (mappingResult.success) {
          mappedIngredients = mappingResult.mappings.map((mapping, idx) => ({
            productId: mapping.matchedProduct.id,
            productName: mapping.productName,
            quantity: mapping.quantity,
            unit: mapping.unit,
            order: idx
          }));

          const createdCount = mappingResult.mappings.filter((m) => m.confidence === "created").length;
          const matchedCount = mappingResult.mappings.filter((m) => m.confidence !== "created").length;
        } else {
          console.error("Ingredient mapping failed:", mappingResult.error);
          throw new Error("Failed to map ingredients to products");
        }
      }

      // Convert RecipeDraft to CreateRecipePayload
      const payload: Partial<CreateRecipePayload> = {
        name: recipe.name || "",
        description: recipe.subtitle || "",
        difficulty: recipe.difficulty || "EASY",
        preparationTime: recipe.preparationTime || 30,
        cookingTime: recipe.cookingTime || 30,
        servings: recipe.servings || 4,
        isPublic: false,
        ingredients: mappedIngredients,
        steps:
          recipe.steps?.map((step) => ({
            stepNumber: step.stepNumber,
            description: step.description,
            duration: step.duration
          })) || []
      };

      onRecipeExtracted(payload);
    }
  };

  return (
    <Card>
      <CardBody className="p-6 space-y-4">
        <div className="flex items-center gap-4 mb-4">
          <Button isIconOnly variant="flat" size="sm" onPress={onBack}>
            <ArrowLeft size={20} />
          </Button>
          <div>
            <h2 className="text-xl font-bold">
              <Trans>Import Recipe from Photo</Trans>
            </h2>
            <p className="text-sm text-default-500">
              <Trans>Take or upload a photo of your recipe</Trans>
            </p>
          </div>
        </div>

        {!selectedFile && <PhotoCapture onPhotoSelected={handlePhotoSelected} isDisabled={isAnalyzing} />}

        {selectedFile && previewUrl && !recipe && (
          <PhotoPreview
            imageUrl={previewUrl}
            isAnalyzing={isAnalyzing}
            onRemove={handleRemove}
            onAnalyze={handleAnalyze}
          />
        )}

        {error && (
          <div className="bg-danger-50 border border-danger-200 rounded-lg p-4 space-y-2">
            <p className="text-danger text-sm font-semibold">
              {error.includes("Rate limit") ? (
                <Trans>Too many requests - Please wait a moment</Trans>
              ) : (
                <Trans>Analysis failed</Trans>
              )}
            </p>
            <p className="text-danger-600 text-xs">{error}</p>
            {error.includes("Rate limit") && (
              <p className="text-default-600 text-xs mt-2">
                <Trans>
                  The AI service is temporarily overloaded. Please wait a minute and try again, or use manual
                  creation.
                </Trans>
              </p>
            )}
            <div className="flex gap-2 mt-3">
              <Button size="sm" variant="flat" onPress={handleRemove}>
                <Trans>Try Another Photo</Trans>
              </Button>
              <Button size="sm" variant="flat" color="primary" onPress={onBack}>
                <Trans>Use Manual Creation</Trans>
              </Button>
            </div>
          </div>
        )}

        {recipe && (
          <div className="space-y-4">
            <RecipePreviewCard recipe={recipe} onEdit={handleUseRecipe} onSave={handleUseRecipe} />
            <Button color="primary" className="w-full" onPress={handleUseRecipe}>
              <Trans>Use This Recipe</Trans>
            </Button>
          </div>
        )}
      </CardBody>
    </Card>
  );
}
