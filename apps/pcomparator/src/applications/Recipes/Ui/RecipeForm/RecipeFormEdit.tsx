"use client";

import { useLingui } from "@lingui/react/macro";
import { Trans } from "@lingui/react/macro";
import { AnimatePresence, motion } from "framer-motion";
import { ChefHat, Info, List } from "lucide-react";
import { useState } from "react";
import { updateRecipe } from "../../Api";
import type { RecipePayload, UpdateRecipePayload } from "../../Domain/Schemas/Recipe.schema";
import { RecipeBasicInfoStep } from "./RecipeBasicInfoStep";
import { RecipeFormLayout } from "./RecipeFormLayout";
import { RecipeFormNavigation } from "./RecipeFormNavigation";
import { RecipeIngredientsStep } from "./RecipeIngredientsStepV2";
import { RecipeStepsStep } from "./RecipeStepsStepV2";

type Step = 1 | 2 | 3;

export interface RecipeFormEditProps {
  recipe: RecipePayload;
}

export const RecipeFormEdit = ({ recipe }: RecipeFormEditProps) => {
  const { t } = useLingui();
  const [currentStep, setCurrentStep] = useState<Step>(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(recipe.imageUrl ?? null);
  const [isUploadingImage, setIsUploadingImage] = useState(false);

  const [formData, setFormData] = useState<
    UpdateRecipePayload & {
      ingredients: NonNullable<UpdateRecipePayload["ingredients"]>;
      steps: NonNullable<UpdateRecipePayload["steps"]>;
    }
  >({
    name: recipe.name,
    description: recipe.description || "",
    difficulty: recipe.difficulty,
    preparationTime: recipe.preparationTime,
    cookingTime: recipe.cookingTime,
    servings: recipe.servings,
    isPublic: recipe.isPublic,
    ingredients: (recipe.ingredients || []).map((ing) => ({
      productId: ing.productId,
      productName: ing.productName || "",
      quantity: ing.quantity,
      unit: ing.unit,
      order: ing.order
    })),
    ingredientGroups: recipe.ingredientGroups || [],
    steps: (recipe.steps || []).map((step) => ({
      stepNumber: step.stepNumber,
      description: step.description,
      duration: step.duration || undefined
    })),
    stepGroups: recipe.stepGroups || []
  });

  const steps = [
    { number: 1 as const, title: t`Information`, icon: Info },
    { number: 2 as const, title: t`Ingredients`, icon: List },
    { number: 3 as const, title: t`Preparation`, icon: ChefHat }
  ];

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveImage = async () => {
    if (recipe.imageUrl && !imageFile) {
      // Delete existing image from server
      try {
        await fetch(`/api/v1/recipes/${recipe.id}/image`, {
          method: "DELETE"
        });
      } catch (err) {
        console.error("Failed to delete image:", err);
      }
    }
    setImageFile(null);
    setImagePreview(null);
  };

  const uploadImage = async (): Promise<void> => {
    if (!imageFile) return;

    setIsUploadingImage(true);
    try {
      const response = await fetch(`/api/v1/recipes/${recipe.id}/image?filename=${imageFile.name}`, {
        method: "PATCH",
        body: imageFile
      });

      if (!response.ok) throw new Error("Failed to upload image");
    } catch (err) {
      console.error("Image upload error:", err);
      throw err;
    } finally {
      setIsUploadingImage(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      // Upload image first if changed
      if (imageFile) {
        await uploadImage();
      }

      // Clean up data before sending
      const dataToSend = { ...formData };

      // If using ingredient groups, clear simple ingredients array
      if (dataToSend.ingredientGroups && dataToSend.ingredientGroups.length > 0) {
        dataToSend.ingredients = [];
      }

      // If using step groups, clear simple steps array
      if (dataToSend.stepGroups && dataToSend.stepGroups.length > 0) {
        dataToSend.steps = [];
      }

      await updateRecipe(recipe.id, dataToSend);
      window.location.href = `/recipes/${recipe.id}`;
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setIsSubmitting(false);
    }
  };

  const updateFormData = (data: Partial<UpdateRecipePayload>) => {
    setFormData({ ...formData, ...data });
  };

  const addIngredient = () => {
    setFormData({
      ...formData,
      ingredients: [
        ...formData.ingredients,
        { productId: "", productName: "", quantity: 1, unit: "unit", order: formData.ingredients.length }
      ]
    });
  };

  const removeIngredient = (index: number) => {
    setFormData({
      ...formData,
      ingredients: formData.ingredients.filter((_, i) => i !== index)
    });
  };

  const updateIngredient = (index: number, field: string, value: any) => {
    const updatedIngredients = [...formData.ingredients];

    if (field === "_batch") {
      // Handle batch update (multiple fields at once)
      updatedIngredients[index] = { ...updatedIngredients[index], ...value };
    } else {
      // Handle single field update
      updatedIngredients[index] = { ...updatedIngredients[index], [field]: value };
    }

    setFormData({ ...formData, ingredients: updatedIngredients });
  };

  const addStep = () => {
    setFormData({
      ...formData,
      steps: [...formData.steps, { stepNumber: formData.steps.length + 1, description: "" }]
    });
  };

  const removeStep = (index: number) => {
    const updatedSteps = formData.steps
      .filter((_, i) => i !== index)
      .map((step, i) => ({ ...step, stepNumber: i + 1 }));
    setFormData({ ...formData, steps: updatedSteps });
  };

  const updateStep = (index: number, field: string, value: any) => {
    const updatedSteps = [...formData.steps];
    updatedSteps[index] = { ...updatedSteps[index], [field]: value };
    setFormData({ ...formData, steps: updatedSteps });
  };

  const canGoToNextStep = () => {
    if (currentStep === 1) {
      return (formData.name && formData.name.trim().length > 0) || false;
    }
    if (currentStep === 2) {
      // Check simple ingredients
      const hasSimpleIngredients =
        formData.ingredients.length > 0 && formData.ingredients.every((ing) => ing.productId);

      // Check grouped ingredients
      const hasGroupIngredients = (formData.ingredientGroups || []).some(
        (group) =>
          group.ingredients && group.ingredients.length > 0 && group.ingredients.every((ing) => ing.productId)
      );

      return hasSimpleIngredients || hasGroupIngredients;
    }
    return true;
  };

  const nextStep = () => {
    if (currentStep < 3 && canGoToNextStep()) {
      setCurrentStep((currentStep + 1) as Step);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep((currentStep - 1) as Step);
    }
  };

  return (
    <RecipeFormLayout
      title={<Trans>Edit Recipe</Trans>}
      description={<Trans>Update your recipe information</Trans>}
      steps={steps}
      currentStep={currentStep}
      error={error}
    >
      <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
        <AnimatePresence mode="wait">
          {currentStep === 1 && (
            <motion.div
              key="step-1"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              <RecipeBasicInfoStep
                formData={formData as any}
                imagePreview={imagePreview}
                onFormDataChange={updateFormData}
                onImageChange={handleImageChange}
                onImageRemove={handleRemoveImage}
              />
            </motion.div>
          )}

          {currentStep === 2 && (
            <motion.div
              key="step-2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              <RecipeIngredientsStep
                ingredients={formData.ingredients}
                ingredientGroups={formData.ingredientGroups}
                onAddIngredient={addIngredient}
                onRemoveIngredient={removeIngredient}
                onUpdateIngredient={updateIngredient}
                onGroupsChange={(groups) => setFormData({ ...formData, ingredientGroups: groups })}
              />
            </motion.div>
          )}

          {currentStep === 3 && (
            <motion.div
              key="step-3"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              <RecipeStepsStep
                steps={formData.steps}
                stepGroups={formData.stepGroups}
                onAddStep={addStep}
                onRemoveStep={removeStep}
                onUpdateStep={updateStep}
                onGroupsChange={(groups) => setFormData({ ...formData, stepGroups: groups })}
              />
            </motion.div>
          )}
        </AnimatePresence>

        <RecipeFormNavigation
          currentStep={currentStep}
          canGoToNextStep={canGoToNextStep()}
          isSubmitting={isSubmitting}
          onPrevStep={prevStep}
          onNextStep={nextStep}
          cancelUrl={`/recipes/${recipe.id}`}
          submitButtonText={t`Update Recipe`}
          submittingText={t`Updating...`}
        />
      </form>
    </RecipeFormLayout>
  );
};
