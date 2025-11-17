"use client";

import { Card, CardBody, Chip, Skeleton } from "@heroui/react";
import { ChefHat, Clock, Heart, Users } from "lucide-react";
import { useRouter } from "next/navigation";
import type { RecipePayload } from "../../Domain/Schemas/Recipe.schema";

interface RecipeCardProps {
  recipe: RecipePayload;
  showFavorite?: boolean;
  isFavorite?: boolean;
  onFavoriteToggle?: (recipeId: string) => void;
  isCompact?: boolean;
}

export function RecipeCard({
  recipe,
  showFavorite = false,
  isFavorite = false,
  onFavoriteToggle,
  isCompact = false
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
        return "Facile";
      case "MEDIUM":
        return "Moyen";
      case "HARD":
        return "Difficile";
      default:
        return difficulty;
    }
  };

  return (
    <Card
      isPressable
      onPress={() => {
        console.log("clicked");
        router.push(`/recipes/${recipe.id}`);
      }}
      className="w-full active:scale-[0.98] sm:hover:scale-[1.02] transition-transform touch-manipulation"
    >
      <CardBody className="p-0">
        <div className="relative w-full h-40 sm:h-48 overflow-hidden">
          {recipe.imageUrl ? (
            <img src={recipe.imageUrl} alt={recipe.name} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center">
              <ChefHat className="w-12 h-12 sm:w-16 sm:h-16 text-white opacity-80" />
            </div>
          )}

          <div className="absolute top-2 sm:top-3 right-2 sm:right-3">
            <Chip size="sm" color={getDifficultyColor(recipe.difficulty)} variant="solid" className="text-xs">
              {getDifficultyLabel(recipe.difficulty)}
            </Chip>
          </div>

          {showFavorite && onFavoriteToggle && (
            <div
              onClick={(e) => {
                e.stopPropagation();
                onFavoriteToggle(recipe.id);
              }}
              className="absolute top-2 sm:top-3 left-2 sm:left-3 z-10 touch-manipulation min-w-[44px] min-h-[44px] flex items-center justify-center"
            >
              <div className="p-2 sm:p-2.5 rounded-full bg-white/90 backdrop-blur-sm hover:bg-white active:bg-white transition-colors">
                <Heart
                  className={`w-4 h-4 sm:w-5 sm:h-5 ${isFavorite ? "fill-danger text-danger" : "text-gray-600"}`}
                />
              </div>
            </div>
          )}
        </div>

        <div className={isCompact ? "p-2.5 sm:p-3" : "p-3 sm:p-4"}>
          <h3 className="font-semibold text-base sm:text-lg text-gray-900 line-clamp-2 sm:line-clamp-1 mb-2">
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
            <p className="text-xs sm:text-sm text-gray-500 line-clamp-2 mb-2 sm:mb-3">{recipe.description}</p>
          )}

          <div className="flex items-center gap-2 sm:gap-3 text-xs sm:text-sm text-gray-500">
            <div className="flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              <span>{recipe.totalTime} min</span>
            </div>
            <div className="flex items-center gap-1">
              <Users className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              <span>{recipe.servings}</span>
            </div>
            <div className="flex items-center gap-1">
              <ChefHat className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              <span>{recipe.ingredients?.length || 0}</span>
            </div>
          </div>
        </div>
      </CardBody>
    </Card>
  );
}

export function RecipeCardSkeleton() {
  return (
    <Card className="w-full">
      <CardBody className="p-0">
        <Skeleton className="w-full h-48 rounded-t-lg" />
        <div className="p-4 space-y-3">
          <Skeleton className="h-6 w-3/4 rounded-lg" />
          <div className="flex gap-2">
            <Skeleton className="h-5 w-16 rounded-lg" />
            <Skeleton className="h-5 w-16 rounded-lg" />
          </div>
          <Skeleton className="h-4 w-full rounded-lg" />
          <Skeleton className="h-4 w-2/3 rounded-lg" />
          <div className="flex gap-3">
            <Skeleton className="h-4 w-16 rounded-lg" />
            <Skeleton className="h-4 w-12 rounded-lg" />
            <Skeleton className="h-4 w-12 rounded-lg" />
          </div>
        </div>
      </CardBody>
    </Card>
  );
}
