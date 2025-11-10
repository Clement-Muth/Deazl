"use client";

import { useLingui } from "@lingui/react/macro";
import { Trans } from "@lingui/react/macro";
import { AnimatePresence, motion } from "framer-motion";
import { ChefHat, Info, List } from "lucide-react";
import { useState } from "react";
import { createRecipe } from "../../Api";
import type { CreateRecipePayload } from "../../Domain/Schemas/Recipe.schema";
import { RecipeBasicInfoStep } from "./RecipeBasicInfoStep";
import { RecipeFormLayout } from "./RecipeFormLayout";
import { RecipeFormNavigation } from "./RecipeFormNavigation";
import { RecipeIngredientsStep } from "./RecipeIngredientsStep";
import { RecipeStepsStep } from "./RecipeStepsStep";

type Step = 1 | 2 | 3;

export const RecipeFormCreate = () => {
  const { t } = useLingui();
  const [currentStep, setCurrentStep] = useState<Step>(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isUploadingImage, setIsUploadingImage] = useState(false);

  const [formData, setFormData] = useState<CreateRecipePayload>({
    name: "",
    description: "",
    difficulty: "EASY",
    preparationTime: 30,
    cookingTime: 30,
    servings: 4,
    isPublic: false,
    ingredients: [{ productId: "", productName: "", quantity: 1, unit: "unit", order: 0 }],
    steps: [{ stepNumber: 1, description: "" }]
  });

  const steps = [
    { number: 1 as const, title: t`Basic Info`, icon: Info },
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

  const handleRemoveImage = () => {
    setImageFile(null);
    setImagePreview(null);
  };

  const uploadImage = async (recipeId: string): Promise<string | null> => {
    if (!imageFile) return null;

    setIsUploadingImage(true);
    try {
      const response = await fetch(`/api/v1/recipes/${recipeId}/image?filename=${imageFile.name}`, {
        method: "PATCH",
        body: imageFile
      });

      if (!response.ok) throw new Error("Failed to upload image");

      const data = await response.json();
      return data.imageUrl;
    } catch (err) {
      console.error("Image upload error:", err);
      return null;
    } finally {
      setIsUploadingImage(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      const recipe = await createRecipe(formData);

      // Upload image if present
      if (imageFile && recipe.id) {
        await uploadImage(recipe.id);
      }

      window.location.href = "/recipes";
    } catch (err) {
      setError(err instanceof Error ? err.message : "Une erreur est survenue");
    } finally {
      setIsSubmitting(false);
    }
  };

  const updateFormData = (data: Partial<CreateRecipePayload>) => {
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
    console.log("Validating step", formData.ingredients);
    if (currentStep === 1) {
      return formData.name.trim().length > 0;
    }
    if (currentStep === 2) {
      return formData.ingredients.length > 0 && formData.ingredients.every((ing) => ing.productId);
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
      title={<Trans>Create a New Recipe</Trans>}
      description={<Trans>Share your favorite recipe with the community</Trans>}
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
                formData={formData}
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
          cancelUrl="/recipes"
          submitButtonText={t`Create Recipe`}
          submittingText={t`Creating...`}
        />
      </form>
    </RecipeFormLayout>
  );
};
