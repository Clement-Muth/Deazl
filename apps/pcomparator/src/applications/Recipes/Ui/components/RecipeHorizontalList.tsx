"use client";

import { Button, ScrollShadow } from "@heroui/react";
import { ArrowRight } from "lucide-react";
import type { ReactNode } from "react";
import { useRef } from "react";
import type { RecipePayload } from "../../Domain/Schemas/Recipe.schema";
import { RecipeCard } from "./RecipeCard";

interface RecipeHorizontalListProps {
  recipes: RecipePayload[];
  title: string;
  icon?: ReactNode;
  onViewAll?: () => void;
  showFavorites?: boolean;
  isLoading?: boolean;
  favoriteRecipeIds?: Set<string>;
  onFavoriteToggle?: (recipeId: string) => void;
}

export function RecipeHorizontalList({
  recipes,
  title,
  icon,
  onViewAll,
  showFavorites = false,
  isLoading = false,
  favoriteRecipeIds,
  onFavoriteToggle
}: RecipeHorizontalListProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: "left" | "right") => {
    if (scrollRef.current) {
      const scrollAmount = 320;
      scrollRef.current.scrollBy({
        left: direction === "right" ? scrollAmount : -scrollAmount,
        behavior: "smooth"
      });
    }
  };

  if (recipes.length === 0) {
    return null;
  }

  return (
    <div className="space-y-3 sm:space-y-4">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 sm:gap-3">
          {icon && <div className="p-1.5 sm:p-2 rounded-lg bg-primary-50">{icon}</div>}
          <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-foreground">{title}</h2>
        </div>

        {onViewAll && (
          <Button
            variant="light"
            // color="primary"
            size="sm"
            endContent={<ArrowRight className="w-3 h-3 sm:w-4 sm:h-4" />}
            onPress={onViewAll}
            className="text-xs sm:text-sm touch-manipulation"
          >
            <span className="hidden sm:inline">Voir plus</span>
            <span className="sm:hidden">Plus</span>
          </Button>
        )}
      </div>

      <div className="relative sm:mx-0">
        <ScrollShadow
          orientation="horizontal"
          size={20}
          className="flex gap-4 -mx-3 px-4 py-4"
          ref={scrollRef}
          hideScrollBar
        >
          {recipes.map((recipe) => (
            <div key={recipe.id} className="min-w-60 sm:min-w-[280px] snap-start snap-always">
              <RecipeCard
                recipe={recipe}
                showFavorite={showFavorites}
                isFavorite={favoriteRecipeIds?.has(recipe.id)}
                onFavoriteToggle={onFavoriteToggle}
                isCompact
              />
            </div>
          ))}
        </ScrollShadow>

        {recipes.length > 3 && (
          <>
            <button
              type="button"
              onClick={() => scroll("left")}
              className="hidden md:flex absolute left-2 top-1/2 -translate-y-1/2 p-2.5 rounded-full bg-white/90 backdrop-blur-sm shadow-lg hover:bg-white active:bg-gray-100 transition-colors z-10 items-center justify-center touch-manipulation"
              aria-label="Scroll left"
            >
              <ArrowRight className="w-5 h-5 rotate-180" />
            </button>
            <button
              type="button"
              onClick={() => scroll("right")}
              className="hidden md:flex absolute right-2 top-1/2 -translate-y-1/2 p-2.5 rounded-full bg-white/90 backdrop-blur-sm shadow-lg hover:bg-white active:bg-gray-100 transition-colors z-10 items-center justify-center touch-manipulation"
              aria-label="Scroll right"
            >
              <ArrowRight className="w-5 h-5" />
            </button>
          </>
        )}
      </div>
    </div>
  );
}
