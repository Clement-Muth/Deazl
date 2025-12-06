"use client";

import { useCallback, useEffect, useState } from "react";
import type { RecipeAuthorInfo as RecipeAuthorInfoType } from "../../Api/recipes/getRecipeAuthor.api";
import type { RecipePayload } from "../../Domain/Schemas/Recipe.schema";
import { PrintRecipeButton } from "../components/PrintRecipeButton";
import { RecipeAuthorInfo } from "../components/RecipeAuthorInfo";
import { RecipeJumpLinks } from "../components/RecipeJumpLinks";
import { RelatedRecipes } from "../components/RelatedRecipes";
import { ServingAdjuster } from "../components/ServingAdjuster";
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
  author?: RecipeAuthorInfoType;
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
  initialPublicPricing,
  author
}: RecipeDetailsMobileProps) {
  const [stepByStepMode, setStepByStepMode] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [stepsCompleted, setStepsCompleted] = useState<StepProgress>({});
  const [isScrolled, setIsScrolled] = useState(false);
  const [scaleFactor, setScaleFactor] = useState(1);
  const [adjustedServings, setAdjustedServings] = useState(recipe.servings);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 30);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleServingsChange = useCallback((newServings: number, newScaleFactor: number) => {
    setAdjustedServings(newServings);
    setScaleFactor(newScaleFactor);
  }, []);

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
    <article className="min-h-screen w-full" itemScope itemType="https://schema.org/Recipe">
      <RecipeDetailsMobileHeader
        recipe={recipe}
        userId={userId}
        isScrolled={isScrolled}
        onBack={onBack}
        onShare={onShare}
        onAddToList={onAddToList}
      />

      <div className="pb-8 lg:mx-auto -mt-16">
        <RecipeDetailsMobileHero recipe={recipe} />

        <div className="flex flex-col justify-center items-center -mt-10 z-20">
          <div className="lg:max-w-6xl w-full">
            <RecipeDetailsMobileDescription recipe={recipe} />

            <div className="px-4 lg:px-8 mt-4">
              <RecipeAuthorInfo
                authorName={author?.name || undefined}
                authorImage={author?.image || undefined}
                createdAt={recipe.createdAt}
                updatedAt={recipe.updatedAt}
                viewsCount={recipe.viewsCount}
                favoritesCount={recipe.favoritesCount}
                isPublic={recipe.isPublic}
              />
            </div>

            <div className="px-4 lg:px-8 mt-4">
              <RecipeJumpLinks hasTips={tips.length > 0} hasNutrition={!!quality} />
            </div>

            <div className="px-4 lg:px-8 mt-4 flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <ServingAdjuster defaultServings={recipe.servings} onServingsChange={handleServingsChange} />
              </div>
              <div className="flex items-center">
                <PrintRecipeButton recipe={recipe} scaleFactor={scaleFactor} />
              </div>
            </div>

            <div className="px-4 space-y-6 mt-6 lg:px-8">
              <section id="recipe-ingredients" aria-labelledby="ingredients-heading">
                <RecipeDetailsMobileIngredients
                  ingredientsWithPrice={ingredientsWithPrice}
                  ingredientGroups={recipe.ingredientGroups}
                  scaleFactor={scaleFactor}
                  onProductClick={onProductClick}
                  recipeId={recipe.id}
                  pricing={pricing}
                  quality={quality}
                />
              </section>

              <section id="recipe-preparation" aria-labelledby="preparation-heading">
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
              </section>

              <section id="recipe-nutrition" aria-labelledby="nutrition-heading">
                <RecipeDetailsMobileNutrition quality={quality} ingredientsWithPrice={ingredientsWithPrice} />
              </section>

              <section id="recipe-tips" aria-labelledby="tips-heading">
                <RecipeDetailsMobileTips tips={tips} />
              </section>

              <RelatedRecipes
                recipeId={recipe.id}
                category={recipe.category}
                cuisine={recipe.cuisine}
                tags={recipe.tags}
              />
            </div>
          </div>
        </div>
      </div>
    </article>
  );
}
