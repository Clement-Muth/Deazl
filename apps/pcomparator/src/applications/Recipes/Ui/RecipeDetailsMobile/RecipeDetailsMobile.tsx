"use client";

import { useEffect, useState } from "react";
import type { RecipePayload } from "../../Domain/Schemas/Recipe.schema";
import { useRecipeData } from "../hooks/useRecipeData";
import RecipeDetailsMobileDescription from "./RecipeDetailsMobileDescription";
import RecipeDetailsMobileHeader from "./RecipeDetailsMobileHeader";
import RecipeDetailsMobileHero from "./RecipeDetailsMobileHero";
import RecipeDetailsMobileIngredients from "./RecipeDetailsMobileIngredients";
import RecipeDetailsMobileNutrition from "./RecipeDetailsMobileNutrition";
import RecipeDetailsMobilePreparation from "./RecipeDetailsMobilePreparation";
import RecipeDetailsMobileTips from "./RecipeDetailsMobileTips";

interface RecipeDetailsMobileProps {
  recipe: RecipePayload;
  userId?: string;
  onBack: () => void;
  onAddToList?: () => void;
  onShare?: () => void;
  onProductClick: (productId: string) => void;
  accessMode?: "public" | "authenticated" | "shared" | "restricted";
  initialPublicPricing?: import("../../Domain/Services/RecipePricing.service").RecipePricingResult | null;
}

interface IngredientWithPrice {
  id: string;
  name: string;
  quantity: number;
  unit: string;
  price?: number;
  store?: string;
  distance?: number;
  labels: Array<"bio" | "eco" | "ultra-processed">;
  allergens: string[];
  nutriScore?: string;
  productId: string | null;
}

interface StepProgress {
  [stepId: string]: boolean;
}

/**
 * Composant RecipeDetails refactorisé - Version mobile-first complète
 *
 * Fonctionnalités :
 * - Scroll vertical unique avec sections collapsibles
 * - Tags cliquables (difficulté, portions, temps, catégorie)
 * - Ingrédients avec prix, labels, allergènes intégrés
 * - Mode step-by-step pour la préparation
 * - Qualité nutritionnelle avec conseils actionnables
 * - Actions rapides (favoris, partage, liste de courses)
 */
export default function RecipeDetailsMobile({
  recipe,
  userId,
  onBack,
  onAddToList,
  onShare,
  onProductClick,
  initialPublicPricing
}: RecipeDetailsMobileProps) {
  const [stepByStepMode, setStepByStepMode] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [stepsCompleted, setStepsCompleted] = useState<StepProgress>({});
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 30);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Calculate scale factor for ingredient quantities
  const scaleFactor = 1; // For now, keep it simple

  // Charger les vraies données depuis la DB avec progressive enhancement
  const { pricing, quality, tips, loading, error } = useRecipeData({
    recipeId: recipe.id,
    userId,
    initialPublicPricing
  });

  // Mapper les vraies données vers le format IngredientWithPrice
  const ingredientsWithPrice: IngredientWithPrice[] =
    recipe.ingredients?.map((ing) => {
      const priceData = pricing?.breakdown.find((b) => b.ingredientId === ing.id);
      const qualityData = quality?.details.find((d) => d.ingredientId === ing.id);

      // Déterminer labels depuis les données qualité
      const labels: Array<"bio" | "eco" | "ultra-processed"> = [];
      if (qualityData?.novaGroup && qualityData.novaGroup === 4) {
        labels.push("ultra-processed");
      }
      if (qualityData?.ecoScore && (qualityData.ecoScore === "A" || qualityData.ecoScore === "B")) {
        labels.push("eco");
      }
      // TODO: Ajouter détection "bio" depuis product.isBio si disponible

      return {
        id: ing.id,
        name: ing.productName || "Product",
        quantity: ing.quantity,
        unit: ing.unit,
        price: priceData?.selected?.price,
        store: priceData?.selected?.storeName,
        distance: priceData?.selected?.distanceKm,
        labels,
        allergens: [], // Les allergènes sont agrégés globalement, pas par ingrédient
        nutriScore: qualityData?.nutriScore,
        productId: ing.productId
      };
    }) || [];

  const toggleStepCompletion = (stepId: string) => {
    setStepsCompleted((prev) => ({ ...prev, [stepId]: !prev[stepId] }));
  };

  const goToNextStep = () => {
    if (recipe.steps && currentStep < recipe.steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const goToPreviousStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  // Afficher erreur si problème de chargement (continuer avec données partielles)
  if (error) {
    console.error("Erreur chargement données recette:", error);
  }

  return (
    <div className="min-h-screen">
      <RecipeDetailsMobileHeader
        recipe={recipe}
        userId={userId}
        isScrolled={isScrolled}
        onBack={onBack}
        onShare={onShare}
        onAddToList={onAddToList}
      />

      {/* Contenu scrollable */}
      <div className="pb-8">
        <RecipeDetailsMobileHero recipe={recipe} />

        <RecipeDetailsMobileDescription recipe={recipe} />

        <div className="px-4 space-y-6 mt-6">
          <RecipeDetailsMobileIngredients
            ingredientsWithPrice={ingredientsWithPrice}
            scaleFactor={scaleFactor}
            onProductClick={onProductClick}
            recipeId={recipe.id}
          />

          <RecipeDetailsMobilePreparation
            recipe={recipe}
            stepByStepMode={stepByStepMode}
            setStepByStepMode={setStepByStepMode}
            currentStep={currentStep}
            setCurrentStep={setCurrentStep}
            stepsCompleted={stepsCompleted}
            toggleStepCompletion={toggleStepCompletion}
            goToNextStep={goToNextStep}
            goToPreviousStep={goToPreviousStep}
          />

          <RecipeDetailsMobileNutrition quality={quality} ingredientsWithPrice={ingredientsWithPrice} />

          <RecipeDetailsMobileTips tips={tips} />
        </div>
      </div>
    </div>
  );
}
