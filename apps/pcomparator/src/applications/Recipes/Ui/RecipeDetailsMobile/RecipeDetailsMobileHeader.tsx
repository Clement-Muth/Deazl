"use client";

import { Button } from "@heroui/react";
import { ChevronLeft, Edit, Heart, Share2, ShoppingCart } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { addRecipeFavorite, getUserFavoriteRecipes, removeRecipeFavorite } from "../../Api";

interface RecipeDetailsMobileHeaderProps {
  recipe: {
    id: string;
    userId?: string;
    name: string;
  };
  userId?: string;
  isScrolled: boolean;
  onBack: () => void;
  onShare?: () => void;
  onAddToList?: () => void;
}

export default function RecipeDetailsMobileHeader({
  recipe,
  userId,
  isScrolled,
  onBack,
  onShare,
  onAddToList
}: RecipeDetailsMobileHeaderProps) {
  const router = useRouter();
  const [isFavorite, setIsFavorite] = useState(false);
  const [loadingFavorite, setLoadingFavorite] = useState(false);

  useEffect(() => {
    getUserFavoriteRecipes()
      .then((favorites) => {
        setIsFavorite(favorites.includes(recipe.id));
      })
      .catch(console.error);
  }, [recipe.id]);

  const handleFavoriteToggle = async () => {
    if (!userId) {
      router.push("/auth/signin");
      return;
    }

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

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 pt-16 ${
        isScrolled ? "backdrop-blur-xl" : "bg-transparent"
      }`}
    >
      <div className="flex items-center justify-between px-4 py-4">
        <Button
          isIconOnly
          size="md"
          onPress={onBack}
          className={`backdrop-blur-xl hover:scale-105 transition-all shadow-lg ${
            isScrolled
              ? "bg-default-100 hover:bg-default-200 text-default-foreground"
              : "bg-black/30 hover:bg-black/40 text-white"
          }`}
        >
          <ChevronLeft className="w-5 h-5" />
        </Button>

        <div className="flex items-center gap-2">
          {userId && recipe.userId === userId && (
            <Button
              isIconOnly
              size="md"
              onPress={() => router.push(`/recipes/${recipe.id}/edit`)}
              className={`backdrop-blur-xl hover:scale-105 transition-all shadow-lg ${
                isScrolled
                  ? "bg-default-100 hover:bg-default-200 text-default-foreground"
                  : "bg-black/30 hover:bg-black/40 text-white"
              }`}
            >
              <Edit className="w-4 h-4" />
            </Button>
          )}
          <Button
            isIconOnly
            size="md"
            onPress={handleFavoriteToggle}
            isLoading={loadingFavorite}
            className={`backdrop-blur-xl hover:scale-105 transition-all shadow-lg ${
              isFavorite
                ? "bg-danger/80 hover:bg-danger/90 border border-danger/30 text-white"
                : isScrolled
                  ? "bg-default-100 hover:bg-default-200 text-default-foreground"
                  : "bg-black/30 hover:bg-black/40 text-white"
            }`}
          >
            <Heart className={`w-4 h-4 transition-all ${isFavorite ? "fill-current scale-110" : ""}`} />
          </Button>
          {onShare && (
            <Button
              isIconOnly
              size="md"
              onPress={onShare}
              className={`backdrop-blur-xl hover:scale-105 transition-all shadow-lg ${
                isScrolled
                  ? "bg-default-100 hover:bg-default-200 text-default-foreground"
                  : "bg-black/30 hover:bg-black/40 text-white"
              }`}
            >
              <Share2 className="w-4 h-4" />
            </Button>
          )}
          {onAddToList && (
            <Button
              isIconOnly
              color="primary"
              size="md"
              onPress={onAddToList}
              className="backdrop-blur-xl bg-primary/80 hover:bg-primary/90 border border-primary/30 hover:scale-105 transition-all shadow-xl shadow-primary/30"
            >
              <ShoppingCart className="w-4 h-4" />
            </Button>
          )}
        </div>
      </div>
    </header>
  );
}
