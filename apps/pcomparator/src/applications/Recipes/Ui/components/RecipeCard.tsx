"use client";

import { Card, CardBody, Chip } from "@heroui/react";
import { Trans } from "@lingui/react/macro";
import { ChefHat, Clock, Eye, Globe, Heart, Lock, Users } from "lucide-react";
import { useRouter } from "next/navigation";
import type { RecipePayload } from "../../Domain/Schemas/Recipe.schema";

interface RecipeCardProps {
  recipe: RecipePayload;
  showFavorite?: boolean;
  showVisibility?: boolean;
  isFavorite?: boolean;
  onFavoriteToggle?: (recipeId: string) => void;
  isCompact?: boolean;
  variant?: "default" | "horizontal" | "minimal";
}

export function RecipeCard({
  recipe,
  showFavorite = false,
  showVisibility = false,
  isFavorite = false,
  onFavoriteToggle,
  isCompact = false,
  variant = "default"
}: RecipeCardProps) {
  const router = useRouter();

  const getDifficultyColor = (difficulty: string) => {
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

  const getDifficultyLabel = (difficulty: string) => {
    switch (difficulty) {
      case "EASY":
        return <Trans>Easy</Trans>;
      case "MEDIUM":
        return <Trans>Medium</Trans>;
      case "HARD":
        return <Trans>Hard</Trans>;
      default:
        return difficulty;
    }
  };

  if (variant === "minimal") {
    return (
      <Card
        isPressable
        onPress={() => router.push(`/recipes/${recipe.id}`)}
        className="w-full shrink-0 active:scale-[0.98] transition-transform touch-manipulation"
      >
        <CardBody className="p-0">
          <div className="relative w-full aspect-4/3 overflow-hidden rounded-t-xl">
            {recipe.imageUrl ? (
              <img src={recipe.imageUrl} alt={recipe.name} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full bg-linear-to-br from-primary-400 to-primary-600 flex items-center justify-center">
                <ChefHat className="w-10 h-10 text-white opacity-80" />
              </div>
            )}
            <div className="absolute top-2 right-2">
              <Chip
                size="sm"
                color={getDifficultyColor(recipe.difficulty)}
                variant="solid"
                className="text-xs"
              >
                {getDifficultyLabel(recipe.difficulty)}
              </Chip>
            </div>
          </div>
          <div className="p-3 flex flex-col gap-1">
            <h3 className="font-semibold text-sm line-clamp-2 min-h-10 leading-tight">{recipe.name}</h3>
            <div className="flex items-center gap-2 text-xs text-default-500">
              <div className="flex items-center gap-1">
                <Clock className="w-3 h-3" />
                <span>{recipe.totalTime} min</span>
              </div>
              <div className="flex items-center gap-1">
                <Users className="w-3 h-3" />
                <span>{recipe.servings}</span>
              </div>
            </div>
          </div>
        </CardBody>
      </Card>
    );
  }

  return (
    <Card
      isPressable
      onPress={() => {
        router.push(`/recipes/${recipe.id}`);
      }}
      className="w-full active:scale-[0.98] sm:hover:scale-[1.02] h-full transition-transform touch-manipulation"
    >
      <CardBody className="p-0 h-full flex flex-col">
        <div className="relative w-full h-40 sm:h-48 overflow-hidden shrink-0">
          {recipe.imageUrl ? (
            <img src={recipe.imageUrl} alt={recipe.name} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full bg-linear-to-br from-primary-400 to-primary-600 flex items-center justify-center">
              <ChefHat className="w-12 h-12 sm:w-16 sm:h-16 text-white opacity-80" />
            </div>
          )}

          <div className="absolute top-2 sm:top-3 right-2 sm:right-3 flex gap-1.5">
            {showVisibility && (
              <Chip
                size="sm"
                variant="solid"
                className="bg-white/90 dark:bg-default-100/90 backdrop-blur-sm text-foreground text-xs"
                startContent={recipe.isPublic ? <Globe className="w-3 h-3" /> : <Lock className="w-3 h-3" />}
              >
                {recipe.isPublic ? <Trans>Public</Trans> : <Trans>Private</Trans>}
              </Chip>
            )}
            <Chip size="sm" color={getDifficultyColor(recipe.difficulty)} variant="solid" className="text-xs">
              {getDifficultyLabel(recipe.difficulty)}
            </Chip>
          </div>

          {showFavorite && (
            <div
              onClick={(e) => {
                e.stopPropagation();
                if (onFavoriteToggle) {
                  onFavoriteToggle(recipe.id);
                }
              }}
              className="absolute top-2 sm:top-3 left-2 sm:left-3 z-10 touch-manipulation min-w-11 min-h-11 flex items-center justify-center"
            >
              <div className="p-2 sm:p-2.5 rounded-full bg-white/90 backdrop-blur-sm hover:bg-white active:bg-white transition-colors">
                <Heart
                  className={`w-4 h-4 sm:w-5 sm:h-5 ${isFavorite ? "fill-danger text-danger" : "text-gray-600"}`}
                />
              </div>
            </div>
          )}
        </div>

        <div className={`${isCompact ? "p-2.5 sm:p-3" : "p-3 sm:p-4"} flex flex-col flex-1`}>
          <h3 className="font-semibold text-base sm:text-lg line-clamp-2 min-h-12 sm:min-h-14 mb-2 leading-tight">
            {recipe.name}
          </h3>

          {!isCompact && (recipe.category || recipe.cuisine) && (
            <div className="flex flex-wrap gap-1 mb-2">
              {recipe.category && (
                <Chip size="sm" color="primary" variant="flat" className="text-xs">
                  {recipe.category}
                </Chip>
              )}
              {recipe.cuisine && (
                <Chip size="sm" color="secondary" variant="flat" className="text-xs">
                  {recipe.cuisine}
                </Chip>
              )}
            </div>
          )}

          {!isCompact && recipe.description && (
            <p
              className="text-xs sm:text-sm text-default-500 line-clamp-2 mb-2 sm:mb-3 flex-1"
              dangerouslySetInnerHTML={{ __html: recipe.description.replace(/<[^>]*>/g, "").trim() }}
            />
          )}

          <div className="flex items-center gap-2 sm:gap-3 text-xs sm:text-sm text-default-500 mt-auto">
            <div className="flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              <span>{recipe.totalTime} min</span>
            </div>
            <div className="flex items-center gap-1">
              <Users className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              <span>{recipe.servings}</span>
            </div>
            {showVisibility && recipe.viewsCount !== undefined ? (
              <div className="flex items-center gap-1 ml-auto">
                <Eye className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                <span>{recipe.viewsCount}</span>
              </div>
            ) : (
              <div className="flex items-center gap-1">
                <ChefHat className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                <span>{recipe.ingredients?.length || 0}</span>
              </div>
            )}
          </div>
        </div>
      </CardBody>
    </Card>
  );
}
