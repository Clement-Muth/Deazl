"use client";

import { Button, Card, CardBody, Checkbox, Chip, Divider } from "@heroui/react";
import { Trans, useLingui } from "@lingui/react/macro";
import { motion } from "framer-motion";
import {
  AlertCircle,
  Check,
  ChefHat,
  ChevronLeft,
  ChevronRight,
  Clock,
  Edit,
  Eye,
  EyeOff,
  Flame,
  Heart,
  Leaf,
  MapPin,
  Pause,
  Play,
  RotateCcw,
  Share2,
  ShoppingCart,
  Sparkles,
  TrendingUp,
  Users
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { addRecipeFavorite, getUserFavoriteRecipes, removeRecipeFavorite } from "../Api";
import type { RecipePayload } from "../Domain/Schemas/Recipe.schema";
import { scaleQuantity } from "../Domain/Utilities/UnitConversion";
import { useRecipeData } from "./hooks/useRecipeData";
import { formatTime, useTimer } from "./hooks/useTimer";

interface RecipeDetailsMobileProps {
  recipe: RecipePayload;
  userId?: string;
  onBack: () => void;
  onAddToList: () => void;
  onShare: () => void;
  onProductClick: (productId: string) => void;
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
  onProductClick
}: RecipeDetailsMobileProps) {
  const { t } = useLingui();
  const router = useRouter();
  const [isFavorite, setIsFavorite] = useState(false);
  const [loadingFavorite, setLoadingFavorite] = useState(false);
  const [hideNoPriceIngredients, setHideNoPriceIngredients] = useState(false);
  const [stepByStepMode, setStepByStepMode] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [stepsCompleted, setStepsCompleted] = useState<StepProgress>({});
  const [showNutritionDetails, setShowNutritionDetails] = useState(false);
  const [adjustedServings, setAdjustedServings] = useState(recipe.servings);

  useEffect(() => {
    getUserFavoriteRecipes()
      .then((favorites) => {
        setIsFavorite(favorites.includes(recipe.id));
      })
      .catch(console.error);
  }, [recipe.id]);

  const handleFavoriteToggle = async () => {
    setLoadingFavorite(true);
    try {
      if (isFavorite) {
        await removeRecipeFavorite(recipe.id);
        setIsFavorite(false);
      } else {
        await addRecipeFavorite(recipe.id);
        setIsFavorite(true);
      }
    } catch (error) {
      console.error("Failed to toggle favorite:", error);
    } finally {
      setLoadingFavorite(false);
    }
  };

  // Calculate scale factor for ingredient quantities
  const scaleFactor = adjustedServings / recipe.servings;

  // Timer pour l'étape actuelle
  const currentStepDuration = recipe.steps?.[currentStep]?.duration
    ? recipe.steps[currentStep].duration * 60
    : 0;
  const timer = useTimer(currentStepDuration);

  // Charger les vraies données depuis la DB
  const { pricing, quality, tips, loading, error } = useRecipeData({ recipeId: recipe.id, userId });

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

  const totalCost = pricing?.totals.optimizedMix || 0;
  const costPerServing = totalCost / recipe.servings;
  const ingredientsWithoutPrice = pricing?.missingCount || 0;

  const qualityScore = quality?.qualityScore || 0;
  const nutriScore = quality?.averageNutriScore || "?";
  const ecoScore = quality?.averageEcoScore || "?";
  const novaGroup = quality?.avgNovaGroup || 0;

  const visibleIngredients = hideNoPriceIngredients
    ? ingredientsWithPrice.filter((ing) => ing.price)
    : ingredientsWithPrice;

  const toggleStepCompletion = (stepId: string) => {
    setStepsCompleted((prev) => ({ ...prev, [stepId]: !prev[stepId] }));
  };

  const goToNextStep = () => {
    if (recipe.steps && currentStep < recipe.steps.length - 1) {
      setCurrentStep(currentStep + 1);
      timer.reset();
    }
  };

  const goToPreviousStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
      timer.reset();
    }
  };

  // Update timer duration when step changes
  useEffect(() => {
    if (recipe.steps?.[currentStep]?.duration) {
      timer.setDuration(recipe.steps[currentStep].duration * 60);
    } else {
      timer.setDuration(0);
    }
  }, [currentStep, recipe.steps]);

  const getQualityColor = (score: number) => {
    if (score >= 80) return "success";
    if (score >= 60) return "warning";
    return "danger";
  };

  const getQualityLabel = (score: number) => {
    if (score >= 80) return t`Excellent`;
    if (score >= 60) return t`Bon`;
    return t`À améliorer`;
  };

  const getLabelColor = (label: string) => {
    switch (label) {
      case "bio":
        return "success";
      case "eco":
        return "primary";
      case "ultra-processed":
        return "danger";
      default:
        return "default";
    }
  };

  const getLabelIcon = (label: string) => {
    switch (label) {
      case "bio":
      case "eco":
        return <Leaf className="w-3 h-3" />;
      case "ultra-processed":
        return <AlertCircle className="w-3 h-3" />;
      default:
        return null;
    }
  };

  const getDifficultyColor = (difficulty: string): "success" | "warning" | "danger" => {
    switch (difficulty) {
      case "EASY":
        return "success";
      case "MEDIUM":
        return "warning";
      case "HARD":
        return "danger";
      default:
        return "warning";
    }
  };

  // Afficher erreur si problème de chargement (continuer avec données partielles)
  if (error) {
    console.error("Erreur chargement données recette:", error);
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header fixe avec actions rapides */}
      <div className="sticky top-0 z-50 bg-white dark:bg-gray-800 border-b border-divider shadow-sm">
        <div className="flex items-center justify-between p-3">
          <Button isIconOnly variant="light" size="sm" onPress={onBack}>
            <ChevronLeft className="w-5 h-5" />
          </Button>

          <div className="flex items-center gap-2">
            {userId && recipe.userId === userId && (
              <Button
                isIconOnly
                variant="light"
                size="sm"
                onPress={() => router.push(`/recipes/${recipe.id}/edit`)}
              >
                <Edit className="w-5 h-5" />
              </Button>
            )}
            <Button
              isIconOnly
              variant="light"
              size="sm"
              onPress={handleFavoriteToggle}
              isLoading={loadingFavorite}
              color={isFavorite ? "danger" : "default"}
            >
              <Heart className={`w-5 h-5 ${isFavorite ? "fill-current" : ""}`} />
            </Button>
            <Button isIconOnly variant="light" size="sm" onPress={onShare}>
              <Share2 className="w-5 h-5" />
            </Button>
            <Button isIconOnly color="primary" size="sm" onPress={onAddToList}>
              <ShoppingCart className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </div>

      {/* Contenu scrollable */}
      <div className="pb-6">
        {/* Image hero */}
        {recipe.imageUrl && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4 }}
            // @ts-ignore
            className="relative w-full h-56 overflow-hidden"
          >
            <img src={recipe.imageUrl} alt={recipe.name} className="w-full h-full object-cover" />
            {/* Gradient overlay pour lisibilité */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
          </motion.div>
        )}

        <div className="px-4 space-y-4">
          {/* Titre & Tags */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.1 }}
            // @ts-ignore
            className="pt-4"
          >
            <h1 className="text-2xl font-bold mb-3 text-gray-900 dark:text-white">{recipe.name}</h1>

            {/* Tags principaux */}
            <div className="flex flex-wrap gap-2 mb-3">
              <Chip
                size="md"
                color={getDifficultyColor(recipe.difficulty)}
                variant="flat"
                className="cursor-pointer"
              >
                {recipe.difficulty === "EASY"
                  ? t`Facile`
                  : recipe.difficulty === "MEDIUM"
                    ? t`Moyen`
                    : t`Difficile`}
              </Chip>
              <Chip size="md" variant="flat" startContent={<Users className="w-4 h-4" />}>
                {recipe.servings} {t`portions`}
              </Chip>
              <Chip size="md" variant="flat" startContent={<Clock className="w-4 h-4" />}>
                {recipe.totalTime} min
              </Chip>
              <Chip size="md" color="primary" variant="flat" startContent={<ChefHat className="w-4 h-4" />}>
                <Trans>Prép.</Trans> {recipe.preparationTime} min
              </Chip>
              <Chip size="md" color="warning" variant="flat" startContent={<Flame className="w-4 h-4" />}>
                <Trans>Cuisson</Trans> {recipe.cookingTime} min
              </Chip>
            </div>

            {/* Description */}
            {recipe.description && (
              <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">{recipe.description}</p>
            )}
          </motion.div>

          <Divider />

          {/* Section Ingrédients avec prix intégrés */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.2 }}
          >
            <Card>
              <CardBody className="p-4">
                {/* Servings adjuster */}
                <div className="flex items-center justify-between mb-4 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-gray-600" />
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      <Trans>Servings:</Trans>
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      variant="flat"
                      isIconOnly
                      onPress={() => setAdjustedServings(Math.max(1, adjustedServings - 1))}
                      isDisabled={adjustedServings <= 1}
                    >
                      −
                    </Button>
                    <span className="text-lg font-bold text-primary min-w-[3rem] text-center">
                      {adjustedServings}
                    </span>
                    <Button
                      size="sm"
                      variant="flat"
                      isIconOnly
                      onPress={() => setAdjustedServings(adjustedServings + 1)}
                    >
                      +
                    </Button>
                    {adjustedServings !== recipe.servings && (
                      <Button
                        size="sm"
                        variant="light"
                        onPress={() => setAdjustedServings(recipe.servings)}
                        className="text-xs"
                      >
                        <Trans>Reset</Trans>
                      </Button>
                    )}
                  </div>
                </div>

                {/* Header avec coût total */}
                <div className="flex items-center justify-between mb-3">
                  <h2 className="text-lg font-bold flex items-center gap-2">
                    <ChefHat className="w-5 h-5 text-primary" />
                    <Trans>Ingrédients</Trans>
                  </h2>
                  <div className="text-right">
                    <div className="text-lg font-bold text-primary">
                      {(totalCost * scaleFactor).toFixed(2)}€
                    </div>
                    <div className="text-xs text-gray-500">
                      {costPerServing.toFixed(2)}€ / {t`portion`}
                    </div>
                  </div>
                </div>

                {/* Option cacher ingrédients sans prix */}
                {ingredientsWithoutPrice > 0 && (
                  <div className="flex items-center justify-between mb-3 p-2 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <span className="text-xs text-gray-600">
                      <Trans>{ingredientsWithoutPrice} sans prix</Trans>
                    </span>
                    <Button
                      size="sm"
                      variant="light"
                      startContent={
                        hideNoPriceIngredients ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />
                      }
                      onPress={() => setHideNoPriceIngredients(!hideNoPriceIngredients)}
                      className="text-xs h-7"
                    >
                      {hideNoPriceIngredients ? t`Afficher` : t`Masquer`}
                    </Button>
                  </div>
                )}

                {/* Liste des ingrédients */}
                <div className="space-y-2">
                  {visibleIngredients.map((ingredient, index) => (
                    <motion.div
                      key={ingredient.id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.3, delay: 0.3 + index * 0.05 }}
                      // @ts-ignore
                      className="p-3 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors cursor-pointer"
                      onClick={() => ingredient.productId && onProductClick(ingredient.productId)}
                    >
                      {/* Ligne 1: Nom + Quantité + Prix */}
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <span className="font-semibold text-gray-900 dark:text-gray-100 text-sm flex-1 min-w-0">
                          {ingredient.name}
                        </span>
                        <div className="flex items-center gap-2 flex-shrink-0">
                          <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                            {(() => {
                              const scaled = scaleQuantity(ingredient.quantity, ingredient.unit, scaleFactor);
                              return `${scaled.value} ${scaled.unit}`;
                            })()}
                          </span>
                          {ingredient.price && (
                            <span className="text-sm font-bold text-success-600">
                              {(ingredient.price * scaleFactor).toFixed(2)}€
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Ligne 2: Badges compacts (store, distance, labels, scores) */}
                      <div className="flex items-center gap-1.5 flex-wrap">
                        {ingredient.store && (
                          <Chip size="sm" variant="flat" className="text-xs h-5">
                            {ingredient.store}
                          </Chip>
                        )}
                        {ingredient.distance !== undefined && (
                          <Chip
                            size="sm"
                            variant="flat"
                            startContent={<MapPin className="w-3 h-3" />}
                            className="text-xs h-5"
                          >
                            {ingredient.distance.toFixed(1)} km
                          </Chip>
                        )}
                        {ingredient.labels.map((label) => (
                          <Chip
                            key={label}
                            size="sm"
                            color={getLabelColor(label)}
                            variant="bordered"
                            startContent={getLabelIcon(label)}
                            className="text-xs h-5"
                          >
                            {label === "bio" ? "Bio" : label === "eco" ? "Éco" : "Ultra"}
                          </Chip>
                        ))}
                        {ingredient.allergens.map((allergen) => (
                          <Chip
                            key={allergen}
                            size="sm"
                            color="warning"
                            variant="bordered"
                            className="text-xs h-5"
                          >
                            {allergen}
                          </Chip>
                        ))}
                        {ingredient.nutriScore && (
                          <Chip
                            size="sm"
                            color={
                              ingredient.nutriScore === "A" || ingredient.nutriScore === "B"
                                ? "success"
                                : "warning"
                            }
                            variant="flat"
                            className="text-xs h-5"
                          >
                            NS: {ingredient.nutriScore}
                          </Chip>
                        )}
                      </div>
                    </motion.div>
                  ))}
                </div>
              </CardBody>
            </Card>
          </motion.div>

          {/* Section Préparation avec mode step-by-step */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.3 }}
          >
            <Card>
              <CardBody className="p-4">
                {/* Header avec toggle step-by-step */}
                <div className="flex items-center justify-between mb-3">
                  <h2 className="text-lg font-bold flex items-center gap-2">
                    <Flame className="w-5 h-5 text-warning" />
                    <Trans>Préparation</Trans>
                  </h2>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="solid"
                      color="success"
                      startContent={<Sparkles className="w-4 h-4" />}
                      onPress={() => router.push(`/recipes/${recipe.id}/cook`)}
                      className="text-xs font-semibold"
                    >
                      <Trans>Mode Cuisine</Trans>
                    </Button>
                    <Button
                      size="sm"
                      variant={stepByStepMode ? "solid" : "flat"}
                      color={stepByStepMode ? "primary" : "default"}
                      onPress={() => setStepByStepMode(!stepByStepMode)}
                      className="text-xs"
                    >
                      {stepByStepMode ? t`Liste complète` : t`Étape par étape`}
                    </Button>
                  </div>
                </div>

                {/* Mode step-by-step */}
                {stepByStepMode && recipe.steps && recipe.steps.length > 0 ? (
                  <div className="space-y-4">
                    {/* Indicateur progression */}
                    <div className="flex items-center justify-between text-sm text-gray-600">
                      <span>
                        <Trans>Étape</Trans> {currentStep + 1} / {recipe.steps.length}
                      </span>
                      <span>
                        {Object.values(stepsCompleted).filter(Boolean).length} / {recipe.steps.length}{" "}
                        <Trans>terminées</Trans>
                      </span>
                    </div>

                    {/* Barre de progression */}
                    <div className="h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-primary transition-all duration-300"
                        style={{ width: `${((currentStep + 1) / recipe.steps.length) * 100}%` }}
                      />
                    </div>

                    {/* Étape actuelle */}
                    <div className="p-4 bg-primary/5 rounded-lg border-2 border-primary/20">
                      <div className="flex items-start gap-3">
                        <div className="flex-shrink-0 w-10 h-10 bg-primary text-primary-foreground rounded-full flex items-center justify-center font-bold text-lg">
                          {recipe.steps[currentStep].stepNumber}
                        </div>
                        <div className="flex-1">
                          <p className="text-sm leading-relaxed text-gray-900 dark:text-gray-100 mb-3">
                            {recipe.steps[currentStep].description}
                          </p>

                          {/* Timer controls */}
                          {recipe.steps[currentStep].duration && recipe.steps[currentStep].duration > 0 && (
                            <div className="space-y-2">
                              <div
                                className={`text-center py-3 px-4 rounded-lg font-mono text-2xl font-bold ${
                                  timer.isFinished
                                    ? "bg-success text-success-foreground"
                                    : timer.isRunning
                                      ? "bg-primary text-primary-foreground animate-pulse"
                                      : "bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                                }`}
                              >
                                {timer.isFinished ? "✅ Done!" : formatTime(timer.timeLeft)}
                              </div>

                              <div className="flex items-center gap-2">
                                <Button
                                  size="sm"
                                  color="primary"
                                  variant="flat"
                                  onPress={timer.isRunning ? timer.pause : timer.start}
                                  isDisabled={timer.timeLeft === 0}
                                  startContent={
                                    timer.isRunning ? (
                                      <Pause className="w-4 h-4" />
                                    ) : (
                                      <Play className="w-4 h-4" />
                                    )
                                  }
                                  className="flex-1"
                                >
                                  {timer.isRunning ? t`Pause` : t`Start`}
                                </Button>
                                <Button
                                  size="sm"
                                  variant="flat"
                                  onPress={timer.reset}
                                  startContent={<RotateCcw className="w-4 h-4" />}
                                >
                                  {t`Reset`}
                                </Button>
                              </div>

                              <p className="text-xs text-gray-600 dark:text-gray-400 text-center">
                                <Trans>Duration:</Trans> {recipe.steps[currentStep].duration} min
                              </p>
                            </div>
                          )}

                          {!recipe.steps[currentStep].duration && (
                            <Chip size="sm" variant="flat" color="default" className="text-xs">
                              <Trans>No timer for this step</Trans>
                            </Chip>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Navigation */}
                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        variant="flat"
                        isDisabled={currentStep === 0}
                        onPress={goToPreviousStep}
                        startContent={<ChevronLeft className="w-4 h-4" />}
                        className="flex-1"
                      >
                        <Trans>Précédent</Trans>
                      </Button>
                      <Button
                        size="sm"
                        color={
                          recipe.steps && stepsCompleted[recipe.steps[currentStep].id] ? "default" : "success"
                        }
                        variant={
                          recipe.steps && stepsCompleted[recipe.steps[currentStep].id] ? "flat" : "solid"
                        }
                        onPress={() => recipe.steps && toggleStepCompletion(recipe.steps[currentStep].id)}
                        startContent={
                          recipe.steps && stepsCompleted[recipe.steps[currentStep].id] ? (
                            <Check className="w-4 h-4" />
                          ) : undefined
                        }
                      >
                        {recipe.steps && stepsCompleted[recipe.steps[currentStep].id]
                          ? t`Fait`
                          : t`Marquer terminé`}
                      </Button>
                      <Button
                        size="sm"
                        variant="flat"
                        isDisabled={currentStep === recipe.steps.length - 1}
                        onPress={goToNextStep}
                        endContent={<ChevronRight className="w-4 h-4" />}
                        className="flex-1"
                      >
                        <Trans>Suivant</Trans>
                      </Button>
                    </div>
                  </div>
                ) : (
                  /* Mode liste complète avec checklist */
                  <div className="space-y-3">
                    {recipe.steps?.map((step, index) => (
                      <div
                        key={step.id}
                        className={`flex gap-3 p-3 rounded-lg border transition-colors ${
                          stepsCompleted[step.id]
                            ? "bg-success/10 border-success/20"
                            : "bg-gray-50 dark:bg-gray-800 border-transparent hover:border-primary/20"
                        }`}
                      >
                        <Checkbox
                          isSelected={stepsCompleted[step.id]}
                          onValueChange={() => toggleStepCompletion(step.id)}
                          size="md"
                          color="success"
                        />
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <div className="flex-shrink-0 w-7 h-7 bg-primary text-primary-foreground rounded-full flex items-center justify-center font-bold text-sm">
                              {step.stepNumber}
                            </div>
                            {step.duration && (
                              <Chip
                                size="sm"
                                variant="flat"
                                color="primary"
                                startContent={<Clock className="w-3 h-3" />}
                                className="text-xs"
                              >
                                {step.duration} min
                              </Chip>
                            )}
                          </div>
                          <p
                            className={`text-sm leading-relaxed ${
                              stepsCompleted[step.id]
                                ? "line-through text-gray-500"
                                : "text-gray-700 dark:text-gray-300"
                            }`}
                          >
                            {step.description}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardBody>
            </Card>
          </motion.div>

          {/* Section Qualité Nutritionnelle */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.4 }}
          >
            <Card>
              <CardBody className="p-4">
                <h2 className="text-lg font-bold mb-3 flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-primary" />
                  <Trans>Qualité nutritionnelle</Trans>
                </h2>

                {/* Score global avec badge */}
                <div className="flex items-center gap-4 mb-4 p-3 bg-gradient-to-r from-primary/10 to-primary/5 rounded-lg">
                  <div className="relative flex-shrink-0">
                    <div
                      className={`w-16 h-16 rounded-full flex items-center justify-center ${
                        getQualityColor(qualityScore) === "success"
                          ? "bg-green-100"
                          : getQualityColor(qualityScore) === "warning"
                            ? "bg-yellow-100"
                            : "bg-red-100"
                      }`}
                    >
                      <div className="text-center">
                        <span
                          className={`text-2xl font-bold ${
                            getQualityColor(qualityScore) === "success"
                              ? "text-green-600"
                              : getQualityColor(qualityScore) === "warning"
                                ? "text-yellow-600"
                                : "text-red-600"
                          }`}
                        >
                          {qualityScore}
                        </span>
                        <span className="text-xs text-gray-600">/100</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex-1">
                    <p className="text-base font-semibold text-gray-700 dark:text-gray-300">
                      {getQualityLabel(qualityScore)}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      {qualityScore >= 80
                        ? t`Cette recette est excellente pour votre santé`
                        : qualityScore >= 60
                          ? t`Cette recette est bonne avec quelques améliorations possibles`
                          : t`Cette recette pourrait être améliorée`}
                    </p>
                  </div>
                </div>

                {/* Badges NutriScore / EcoScore / Nova */}
                <div className="grid grid-cols-3 gap-2 mb-4">
                  <div className="p-2 bg-gray-50 dark:bg-gray-800 rounded-lg text-center">
                    <p className="text-xs text-gray-600 mb-1">
                      <Trans>NutriScore</Trans>
                    </p>
                    <Chip size="md" color="success" variant="flat" className="font-bold">
                      {nutriScore}
                    </Chip>
                  </div>
                  <div className="p-2 bg-gray-50 dark:bg-gray-800 rounded-lg text-center">
                    <p className="text-xs text-gray-600 mb-1">
                      <Trans>EcoScore</Trans>
                    </p>
                    <Chip size="md" color="warning" variant="flat" className="font-bold">
                      {ecoScore}
                    </Chip>
                  </div>
                  <div className="p-2 bg-gray-50 dark:bg-gray-800 rounded-lg text-center">
                    <p className="text-xs text-gray-600 mb-1">
                      <Trans>Nova</Trans>
                    </p>
                    <Chip size="md" color="primary" variant="flat" className="font-bold">
                      {novaGroup > 0 ? novaGroup.toFixed(1) : "-"}
                    </Chip>
                  </div>
                </div>

                {/* Alertes nutritionnelles */}
                {quality?.nutritionalAlerts && quality.nutritionalAlerts.length > 0 && (
                  <div className="mb-4 space-y-2">
                    {quality.nutritionalAlerts.map((alert, idx) => {
                      const bgColor =
                        alert.severity === "danger"
                          ? "bg-red-50 dark:bg-red-900/10 border-red-500"
                          : "bg-orange-50 dark:bg-orange-900/10 border-orange-500";
                      const textColor = alert.severity === "danger" ? "text-red-700" : "text-orange-700";
                      const icon = alert.severity === "danger" ? "⚠️" : "⚡";

                      return (
                        <div key={`${alert.type}-${idx}`} className={`p-3 rounded-lg border-l-4 ${bgColor}`}>
                          <div className="flex items-start gap-2">
                            <span className="text-sm">{icon}</span>
                            <div className="flex-1">
                              <p className={`text-xs font-semibold ${textColor} mb-1`}>
                                {alert.type === "salt" ? (
                                  <Trans>Too salty</Trans>
                                ) : alert.type === "sugar" ? (
                                  <Trans>Too sweet</Trans>
                                ) : (
                                  <Trans>Too much saturated fat</Trans>
                                )}
                              </p>
                              <p className="text-xs text-gray-600 dark:text-gray-400">{alert.message}</p>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* Additifs avec noms et risques */}
                {quality?.additives && quality.additives.length > 0 && (
                  <div className="mb-4">
                    <p className="text-xs font-medium text-gray-700 dark:text-gray-300 mb-2">
                      <Trans>Detected additives:</Trans>
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {quality.additives.map((additive) => {
                        const riskColor =
                          additive.riskLevel === "dangerous"
                            ? "danger"
                            : additive.riskLevel === "high_risk"
                              ? "warning"
                              : additive.riskLevel === "moderate"
                                ? "warning"
                                : "success";

                        return (
                          <Chip
                            key={additive.id}
                            size="sm"
                            color={riskColor}
                            variant="flat"
                            className="text-xs"
                          >
                            {additive.name}
                          </Chip>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Allergènes */}
                {quality?.allergens && quality.allergens.length > 0 && (
                  <div className="mb-4">
                    <p className="text-xs font-medium text-gray-700 dark:text-gray-300 mb-2">
                      <Trans>Allergènes :</Trans>
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {quality.allergens.map((allergen) => (
                        <Chip key={allergen} size="sm" color="warning" variant="flat" className="text-xs">
                          {allergen}
                        </Chip>
                      ))}
                    </div>
                  </div>
                )}

                {/* Conseils actionnables (vraies recommendations) */}
                {quality?.recommendations && quality.recommendations.length > 0 && (
                  <div className="space-y-2 mb-3">
                    <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      <Trans>Suggestions d'amélioration :</Trans>
                    </p>
                    <div className="space-y-2">
                      {quality.recommendations.slice(0, 3).map((rec, idx) => {
                        const borderColor =
                          rec.priority === "high"
                            ? "border-red-500 bg-red-50 dark:bg-red-900/10"
                            : rec.priority === "medium"
                              ? "border-yellow-500 bg-yellow-50 dark:bg-yellow-900/10"
                              : "border-blue-500 bg-blue-50 dark:bg-blue-900/10";
                        const iconColor =
                          rec.priority === "high"
                            ? "text-red-600"
                            : rec.priority === "medium"
                              ? "text-yellow-600"
                              : "text-blue-600";
                        const Icon =
                          rec.type === "substitute"
                            ? Leaf
                            : rec.type === "remove"
                              ? AlertCircle
                              : AlertCircle;

                        return (
                          <div
                            key={`${rec.ingredientId}-${idx}`}
                            className={`p-2.5 rounded-lg border-l-3 ${borderColor}`}
                          >
                            <div className="flex items-start gap-2">
                              <Icon className={`w-4 h-4 ${iconColor} flex-shrink-0 mt-0.5`} />
                              <div className="flex-1 min-w-0">
                                <p className="text-xs font-medium text-gray-900 dark:text-gray-100">
                                  {rec.suggestion}
                                </p>
                                <p className="text-xs text-gray-600 dark:text-gray-400 mt-0.5">
                                  <Trans>Amélioration de +{rec.expectedQualityGain} points</Trans>
                                </p>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Détails nutrition par ingrédient */}
                {ingredientsWithPrice.length > 0 && (
                  <div className="mt-4">
                    <Button
                      fullWidth
                      size="sm"
                      variant="flat"
                      onPress={() => setShowNutritionDetails(!showNutritionDetails)}
                      endContent={
                        showNutritionDetails ? (
                          <ChevronLeft className="w-4 h-4 rotate-90" />
                        ) : (
                          <ChevronRight className="w-4 h-4 rotate-90" />
                        )
                      }
                    >
                      {showNutritionDetails ? t`Hide details` : t`Show nutrition details`}
                    </Button>

                    {showNutritionDetails && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3 }}
                        // @ts-ignore
                        className="mt-3 space-y-2"
                      >
                        {ingredientsWithPrice.slice(0, 5).map((ing) => (
                          <div
                            key={ing.id}
                            className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700"
                          >
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                                {ing.name}
                              </span>
                              {ing.nutriScore && (
                                <Chip size="sm" color="success" variant="flat" className="text-xs">
                                  {ing.nutriScore}
                                </Chip>
                              )}
                            </div>
                            <div className="grid grid-cols-2 gap-2 text-xs text-gray-600 dark:text-gray-400">
                              <div>
                                <span className="font-medium">
                                  <Trans>Labels:</Trans>
                                </span>{" "}
                                {ing.labels.join(", ") || "-"}
                              </div>
                              <div>
                                <span className="font-medium">
                                  <Trans>Allergens:</Trans>
                                </span>{" "}
                                {ing.allergens.join(", ") || t`None`}
                              </div>
                            </div>
                          </div>
                        ))}
                      </motion.div>
                    )}
                  </div>
                )}
              </CardBody>
            </Card>
          </motion.div>

          {/* Section Astuces (depuis DB) */}
          {tips.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.5 }}
            >
              <Card>
                <CardBody className="p-4">
                  <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-3">
                    <Trans>Tips & Advice</Trans>
                  </h3>
                  <div className="space-y-2">
                    {tips.map((tip) => (
                      <div
                        key={tip.id}
                        className="p-3 bg-blue-50 dark:bg-blue-900/10 border-l-3 border-blue-500 rounded-r-lg"
                      >
                        {tip.title && (
                          <p className="text-xs font-semibold text-blue-900 dark:text-blue-300 mb-1">
                            {tip.title}
                          </p>
                        )}
                        <p className="text-xs text-gray-700 dark:text-gray-300">{tip.content}</p>
                      </div>
                    ))}
                  </div>
                </CardBody>
              </Card>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}
