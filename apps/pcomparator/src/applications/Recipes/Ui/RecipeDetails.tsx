"use client";

import { Button, Card, CardBody, CardHeader, Chip, Tooltip, useDisclosure } from "@heroui/react";
import { Trans } from "@lingui/react/macro";
import { motion } from "framer-motion";
import { ArrowLeftIcon, ChefHat, Clock, Edit, Flame, Printer, Share2, Users } from "lucide-react";
import { useRouter } from "next/navigation";
import type { RecipePayload } from "../Domain/Schemas/Recipe.schema";
import ShareRecipeModal from "./RecipeDetails/ShareRecipeModal/ShareRecipeModal";

interface RecipeDetailsProps {
  recipe: RecipePayload;
}

export default function RecipeDetails({ recipe }: RecipeDetailsProps) {
  const router = useRouter();
  const { isOpen, onOpen, onClose } = useDisclosure();

  const getDifficultyLabel = (difficulty: string) => {
    switch (difficulty) {
      case "EASY":
        return <Trans>Facile</Trans>;
      case "MEDIUM":
        return <Trans>Moyen</Trans>;
      case "HARD":
        return <Trans>Difficile</Trans>;
      default:
        return difficulty;
    }
  };

  const getDifficultyColorHero = (difficulty: string): "success" | "warning" | "danger" | "default" => {
    switch (difficulty) {
      case "EASY":
        return "success";
      case "MEDIUM":
        return "warning";
      case "HARD":
        return "danger";
      default:
        return "default";
    }
  };

  return (
    <div className="space-y-3 sm:space-y-4">
      {/* Header with actions */}
      <div className="flex flex-col gap-3 sm:gap-4 mb-4 sm:mb-6 pb-3 sm:pb-4 border-b border-gray-200">
        <div className="flex items-center justify-between gap-2">
          <Tooltip content="Retour aux recettes">
            <Button
              variant="light"
              size="sm"
              startContent={<ArrowLeftIcon className="h-3 w-3 sm:h-4 sm:w-4" />}
              className="text-primary-500 hover:shadow-sm transition-all px-0 min-w-0 text-sm sm:text-base truncate"
              onPress={() => router.push("/recipes")}
            >
              <span className="truncate max-w-[150px] sm:max-w-none">{recipe.name}</span>
            </Button>
          </Tooltip>

          <div className="flex items-center gap-1 sm:gap-2">
            <Tooltip content="Partager la recette">
              <Button variant="light" size="sm" isIconOnly onPress={onOpen}>
                <Share2 className="h-3 w-3 sm:h-4 sm:w-4" />
              </Button>
            </Tooltip>

            <Tooltip content="Modifier la recette">
              <Button
                variant="light"
                size="sm"
                isIconOnly
                onPress={() => router.push(`/recipes/${recipe.id}/edit`)}
              >
                <Edit className="h-3 w-3 sm:h-4 sm:w-4" />
              </Button>
            </Tooltip>

            <Tooltip content="Imprimer">
              <Button variant="light" size="sm" isIconOnly onPress={() => window.print()}>
                <Printer className="h-3 w-3 sm:h-4 sm:w-4" />
              </Button>
            </Tooltip>
          </div>
        </div>
      </div>

      {/* Share Modal */}
      <ShareRecipeModal isOpen={isOpen} onClose={onClose} recipeId={recipe.id} recipeName={recipe.name} />

      {/* Image with animation */}
      {recipe.imageUrl && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          // className="w-full h-48 sm:h-64 md:h-80 lg:h-96 overflow-hidden rounded-large mb-4 sm:mb-6"
        >
          <img src={recipe.imageUrl} alt={recipe.name} className="w-full h-full object-cover" />
        </motion.div>
      )}

      {/* Main info card with animation */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1 }}
      >
        <Card className="mb-4 sm:mb-6">
          <CardHeader className="border-b border-divider p-4 sm:p-6">
            <h1 className="text-2xl sm:text-3xl font-bold mb-1 sm:mb-2">{recipe.name}</h1>
          </CardHeader>
          <CardBody className="space-y-3 sm:space-y-4 p-4 sm:p-6">
            <div>
              {recipe.description && (
                <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400">{recipe.description}</p>
              )}
            </div>

            <div className="flex flex-wrap gap-1.5 sm:gap-2">
              <Chip
                size="md"
                color={getDifficultyColorHero(recipe.difficulty)}
                variant="flat"
                className="text-xs sm:text-sm"
              >
                {getDifficultyLabel(recipe.difficulty)}
              </Chip>
              <Chip
                size="md"
                startContent={<Users className="w-3 h-3 sm:w-4 sm:h-4" />}
                variant="flat"
                className="text-xs sm:text-sm"
              >
                {recipe.servings} <Trans>pers.</Trans>
              </Chip>
              <Chip
                size="md"
                startContent={<Clock className="w-3 h-3 sm:w-4 sm:h-4" />}
                variant="flat"
                className="text-xs sm:text-sm"
              >
                {recipe.totalTime} <Trans>min</Trans>
              </Chip>
              <Chip
                size="md"
                startContent={<ChefHat className="w-3 h-3 sm:w-4 sm:h-4" />}
                variant="flat"
                color="primary"
                className="text-xs sm:text-sm"
              >
                <Trans>Prép.</Trans> {recipe.preparationTime} min
              </Chip>
              <Chip
                size="md"
                startContent={<Flame className="w-3 h-3 sm:w-4 sm:h-4" />}
                variant="flat"
                color="warning"
                className="text-xs sm:text-sm"
              >
                <Trans>Cuisson</Trans> {recipe.cookingTime} min
              </Chip>
            </div>
          </CardBody>
        </Card>
      </motion.div>

      {/* Ingredients and Steps grid with animations */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4, delay: 0.2 }}
          // className="lg:col-span-1"
        >
          <Card>
            <CardHeader className="border-b border-divider p-4 sm:p-6">
              <h2 className="text-lg sm:text-xl font-semibold flex items-center gap-2">
                <ChefHat className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
                <Trans>Ingrédients</Trans>
              </h2>
            </CardHeader>
            <CardBody className="p-4 sm:p-6">
              <ul className="space-y-2 sm:space-y-3">
                {recipe.ingredients?.map((ingredient, index) => (
                  <motion.li
                    key={ingredient.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: 0.3 + index * 0.05 }}
                    // className="flex items-start gap-2 sm:gap-3 p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors text-sm sm:text-base"
                  >
                    <span className="text-primary mt-1 font-bold">•</span>
                    <span className="flex-1">
                      <span className="font-semibold text-gray-900 dark:text-gray-100">
                        {ingredient.quantity} {ingredient.unit}
                      </span>{" "}
                      <span className="text-gray-600 dark:text-gray-400">
                        {ingredient.customName || ingredient.productId}
                      </span>
                    </span>
                  </motion.li>
                ))}
              </ul>
            </CardBody>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4, delay: 0.3 }}
          // className="lg:col-span-2"
        >
          <Card>
            <CardHeader className="border-b border-divider p-4 sm:p-6">
              <h2 className="text-lg sm:text-xl font-semibold flex items-center gap-2">
                <Flame className="w-4 h-4 sm:w-5 sm:h-5 text-warning" />
                <Trans>Préparation</Trans>
              </h2>
            </CardHeader>
            <CardBody className="p-4 sm:p-6">
              <div className="space-y-4 sm:space-y-6">
                {recipe.steps?.map((step, index) => (
                  <motion.div
                    key={step.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: 0.4 + index * 0.1 }}
                    // className="flex gap-3 sm:gap-4 p-2 sm:p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                  >
                    <div className="flex-shrink-0 w-8 h-8 sm:w-10 sm:h-10 bg-primary text-primary-foreground rounded-full flex items-center justify-center font-bold text-base sm:text-lg shadow-md">
                      {step.stepNumber}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm sm:text-base text-gray-700 dark:text-gray-300 leading-relaxed">
                        {step.description}
                      </p>
                      {step.duration && (
                        <Chip
                          size="sm"
                          variant="flat"
                          color="primary"
                          startContent={<Clock className="w-3 h-3" />}
                          className="mt-2"
                        >
                          {step.duration} <Trans>min</Trans>
                        </Chip>
                      )}
                    </div>
                  </motion.div>
                ))}
              </div>
            </CardBody>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
