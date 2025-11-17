"use client";

import { useCallback, useEffect, useState } from "react";
import { addRecipeFavorite, getUserFavoriteRecipes, removeRecipeFavorite } from "../Api";

export function useRecipeFavorites() {
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadFavorites();
  }, []);

  const loadFavorites = async () => {
    try {
      const favoriteIds = await getUserFavoriteRecipes();
      setFavorites(new Set(favoriteIds));
    } catch (error) {
      console.error("Failed to load favorites:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleFavorite = useCallback(
    async (recipeId: string) => {
      const isFavorite = favorites.has(recipeId);

      // Optimistic update
      setFavorites((prev) => {
        const next = new Set(prev);
        if (isFavorite) {
          next.delete(recipeId);
        } else {
          next.add(recipeId);
        }
        return next;
      });

      try {
        if (isFavorite) {
          await removeRecipeFavorite(recipeId);
        } else {
          await addRecipeFavorite(recipeId);
        }
      } catch (error) {
        // Revert on error
        setFavorites((prev) => {
          const next = new Set(prev);
          if (isFavorite) {
            next.add(recipeId);
          } else {
            next.delete(recipeId);
          }
          return next;
        });
        console.error("Failed to toggle favorite:", error);
      }
    },
    [favorites]
  );

  const isFavorite = useCallback((recipeId: string) => favorites.has(recipeId), [favorites]);

  return {
    favorites,
    isLoading,
    toggleFavorite,
    isFavorite
  };
}
