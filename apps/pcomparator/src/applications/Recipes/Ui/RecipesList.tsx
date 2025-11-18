"use client";

import { Button, Chip } from "@heroui/react";
import { AnimatePresence, motion } from "framer-motion";
import { ChefHat, Clock, Edit, Heart, Share2, Trash2, Users } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { PressableCard } from "~/components/PressableCard/PressableCard";
import { addRecipeFavorite, deleteRecipe, getUserFavoriteRecipes, removeRecipeFavorite } from "../Api";
import type { RecipePayload } from "../Domain/Schemas/Recipe.schema";

interface RecipesListProps {
  recipes: RecipePayload[];
  showFavorites?: boolean;
  isAuthenticated?: boolean;
}

export default function RecipesList({
  recipes,
  showFavorites = false,
  isAuthenticated = true
}: RecipesListProps) {
  const router = useRouter();
  const [favorites, setFavorites] = useState<string[]>([]);
  const [loadingFavorites, setLoadingFavorites] = useState<Record<string, boolean>>({});

  useEffect(() => {
    if (showFavorites && isAuthenticated) {
      getUserFavoriteRecipes().then(setFavorites).catch(console.error);
    }
  }, [showFavorites, isAuthenticated]);

  const handleFavoriteToggle = async (recipeId: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!isAuthenticated) {
      router.push("/auth/signin");
      return;
    }

    setLoadingFavorites((prev) => ({ ...prev, [recipeId]: true }));

    try {
      if (favorites.includes(recipeId)) {
        await removeRecipeFavorite(recipeId);
        setFavorites((prev) => prev.filter((id) => id !== recipeId));
      } else {
        await addRecipeFavorite(recipeId);
        setFavorites((prev) => [...prev, recipeId]);
      }
    } catch (error) {
      console.error("Failed to toggle favorite:", error);
    } finally {
      setLoadingFavorites((prev) => ({ ...prev, [recipeId]: false }));
    }
  };

  const handleDeleteRecipe = async (recipeId: string) => {
    try {
      await deleteRecipe(recipeId);
      router.refresh();
    } catch (error) {
      console.error("Failed to delete recipe:", error);
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "EASY":
        return "#16a34a"; // green-600
      case "MEDIUM":
        return "#f59e0b"; // amber-500
      case "HARD":
        return "#dc2626"; // red-600
      default:
        return "#6b7280"; // gray-500
    }
  };

  return (
    <AnimatePresence mode="popLayout">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {recipes.map((recipe, index) => (
          <motion.div
            key={recipe.id}
            layout
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{
              type: "spring",
              stiffness: 500,
              damping: 30,
              delay: index * 0.05
            }}
          >
            <PressableCard
              onPress={() => router.push(`/recipes/${recipe.id}`)}
              actions={[
                {
                  key: "edit",
                  label: "Edit Recipe",
                  icon: <Edit className="w-5 h-5" />,
                  color: "primary",
                  onAction: () => router.push(`/recipes/${recipe.id}/edit`)
                },
                {
                  key: "share",
                  label: "Share Recipe",
                  icon: <Share2 className="w-5 h-5" />,
                  color: "secondary",
                  onAction: () => {}
                },
                {
                  key: "delete",
                  label: "Delete Recipe",
                  icon: <Trash2 className="w-5 h-5" />,
                  color: "danger",
                  onAction: () => handleDeleteRecipe(recipe.id)
                }
              ]}
            >
              {/* Image Header */}
              <div className="relative w-full h-48 overflow-hidden">
                {recipe.imageUrl ? (
                  <img
                    src={recipe.imageUrl}
                    alt={recipe.name}
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center">
                    <ChefHat className="w-16 h-16 text-white opacity-80" />
                  </div>
                )}
                {/* Difficulty Badge */}
                <div
                  className="absolute top-3 right-3 px-3 py-1 rounded-full text-white text-xs font-semibold shadow-lg"
                  style={{ backgroundColor: getDifficultyColor(recipe.difficulty) }}
                >
                  {recipe.difficulty === "EASY" && "Facile"}
                  {recipe.difficulty === "MEDIUM" && "Moyen"}
                  {recipe.difficulty === "HARD" && "Difficile"}
                </div>
                {/* Favorite Button */}
                {showFavorites && (
                  <div
                    onClick={(e) => handleFavoriteToggle(recipe.id, e)}
                    className="absolute top-3 left-3 z-10"
                  >
                    <Button
                      isIconOnly
                      size="sm"
                      variant="flat"
                      color="danger"
                      className="bg-white/90 backdrop-blur-sm"
                      isLoading={loadingFavorites[recipe.id]}
                    >
                      <Heart className={`w-4 h-4 ${favorites.includes(recipe.id) ? "fill-current" : ""}`} />
                    </Button>
                  </div>
                )}
              </div>

              {/* Content */}
              <div className="p-4">
                <h2 className="font-semibold text-lg text-gray-900 line-clamp-1 group-hover:text-primary-600 transition-colors mb-2">
                  {recipe.name}
                </h2>

                {(recipe.category || recipe.cuisine) && (
                  <div className="flex flex-wrap gap-1 mb-2">
                    {recipe.category && (
                      <Chip size="sm" color="primary" variant="flat">
                        {recipe.category}
                      </Chip>
                    )}
                    {recipe.cuisine && (
                      <Chip size="sm" color="secondary" variant="flat">
                        {recipe.cuisine}
                      </Chip>
                    )}
                  </div>
                )}

                {recipe.description && (
                  <p className="text-sm text-gray-500 line-clamp-2 mb-4">{recipe.description}</p>
                )}

                {/* Metadata */}
                <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500">
                  <div className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    <span>{recipe.totalTime} min</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Users className="w-4 h-4" />
                    <span>{recipe.servings} pers.</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <ChefHat className="w-4 h-4" />
                    <span>{recipe.ingredients?.length || 0} ingr.</span>
                  </div>
                </div>

                {/* Progress Bar for Steps */}
                {recipe.steps && recipe.steps.length > 0 && (
                  <div className="mt-4 space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-medium text-gray-600">Étapes</span>
                      <span className="text-gray-500">{recipe.steps.length}</span>
                    </div>
                    <div className="h-1.5 overflow-hidden rounded-full bg-gray-100">
                      <motion.div
                        style={{
                          height: "100%",
                          borderRadius: "9999px",
                          backgroundColor: "var(--primary-600)"
                        }}
                        initial={{ width: "0%" }}
                        animate={{ width: "100%" }}
                        transition={{
                          type: "spring",
                          stiffness: 300,
                          damping: 30,
                          delay: index * 0.05 + 0.2
                        }}
                      />
                    </div>
                  </div>
                )}
              </div>
            </PressableCard>
          </motion.div>
        ))}
      </div>
    </AnimatePresence>
  );
}
