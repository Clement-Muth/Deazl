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
import { RecipeIngredientsStep } from "./RecipeIngredientsStep";
import { RecipeStepsStep } from "./RecipeStepsStep";

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
      customName: ing.customName || "",
      quantity: ing.quantity,
      unit: ing.unit,
      order: ing.order,
      productId: ing.productId || undefined
    })),
    steps: (recipe.steps || []).map((step) => ({
      stepNumber: step.stepNumber,
      description: step.description,
      duration: step.duration || undefined
    }))
  });

  const steps = [
    { number: 1 as const, title: t`Informations`, icon: Info },
    { number: 2 as const, title: t`Ingrédients`, icon: List },
    { number: 3 as const, title: t`Préparation`, icon: ChefHat }
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

      await updateRecipe(recipe.id, formData);
      window.location.href = `/recipes/${recipe.id}`;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Une erreur est survenue");
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
        { quantity: 1, unit: "unit", order: formData.ingredients.length }
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
    updatedIngredients[index] = { ...updatedIngredients[index], [field]: value };
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
      return formData.ingredients.length > 0 && formData.ingredients.every((ing) => ing.customName);
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
      title={<Trans>Modifier la recette</Trans>}
      description={<Trans>Mettez à jour les informations de votre recette</Trans>}
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
                onAddIngredient={addIngredient}
                onRemoveIngredient={removeIngredient}
                onUpdateIngredient={updateIngredient}
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
                onAddStep={addStep}
                onRemoveStep={removeStep}
                onUpdateStep={updateStep}
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
          submitButtonText={t`Mettre à jour la recette`}
          submittingText={t`Mise à jour en cours...`}
        />
      </form>
    </RecipeFormLayout>
  );
};
