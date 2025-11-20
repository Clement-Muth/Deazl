"use client";

import { Chip } from "@heroui/react";
import { motion } from "framer-motion";
import { ChefHat } from "lucide-react";

interface RecipeDetailsMobileHeroProps {
  recipe: {
    imageUrl?: string | null;
    name: string;
    tags?: string[];
  };
}

export default function RecipeDetailsMobileHero({ recipe }: RecipeDetailsMobileHeroProps) {
  return (
    <>
      {recipe.imageUrl ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6 }}
          className="relative w-full h-[60vh] min-h-[400px] overflow-hidden"
        >
          <div className="absolute inset-0">
            <img src={recipe.imageUrl} alt={recipe.name} className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-linear-to-b from-black/20 via-transparent to-black/30" />
          </div>

          {recipe.tags && recipe.tags.length > 0 && (
            <div className="absolute top-20 left-4 z-20">
              <Chip
                size="lg"
                className="bg-primary/90 backdrop-blur-xl border-2 border-white/30 font-bold text-white shadow-xl px-4 py-5"
                startContent={<ChefHat className="w-5 h-5" />}
              >
                {recipe.tags[0]}
              </Chip>
            </div>
          )}

          <div className="absolute bottom-2 left-1/2 -translate-x-1/2 w-16 h-1.5 bg-white/40 rounded-full" />
        </motion.div>
      ) : (
        <div className="px-4 pt-20 pb-6">
          <h1 className="text-3xl font-bold text-center mb-4 text-gray-900 dark:text-white">{recipe.name}</h1>
        </div>
      )}
    </>
  );
}
