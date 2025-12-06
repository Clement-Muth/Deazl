"use client";

import { Chip } from "@heroui/react";
import { motion } from "framer-motion";
import { ChefHat } from "lucide-react";
import Image from "next/image";

interface RecipeDetailsMobileHeroProps {
  recipe: {
    imageUrl?: string | null;
    name: string;
    tags?: string[];
  };
}

export default function RecipeDetailsMobileHero({ recipe }: RecipeDetailsMobileHeroProps) {
  return (
    <header>
      {recipe.imageUrl ? (
        <motion.figure
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6 }}
          className="relative w-full h-[60vh] min-h-[400px] overflow-hidden"
          role="img"
          aria-label={`Photo of ${recipe.name}`}
          itemProp="image"
        >
          <div className="absolute inset-0">
            <Image
              src={recipe.imageUrl}
              alt={`${recipe.name} - Recipe photo`}
              fill
              priority
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 1200px"
              className="object-cover"
              itemProp="image"
            />
            <div
              className="absolute inset-0 bg-linear-to-b from-black/20 via-transparent to-black/30"
              aria-hidden="true"
            />
          </div>

          {recipe.tags && recipe.tags.length > 0 && (
            <div className="absolute top-20 left-4 z-20">
              <Chip
                size="lg"
                className="bg-primary/90 backdrop-blur-xl border-2 border-white/30 font-bold text-white shadow-xl px-4 py-5"
                startContent={<ChefHat className="w-5 h-5" aria-hidden="true" />}
              >
                <span itemProp="recipeCategory">{recipe.tags[0]}</span>
              </Chip>
            </div>
          )}

          <div
            className="absolute bottom-2 left-1/2 -translate-x-1/2 w-16 h-1.5 bg-white/40 rounded-full"
            aria-hidden="true"
          />
        </motion.figure>
      ) : (
        <div className="px-4 pt-20 pb-6">
          <h1 className="text-3xl font-bold text-center mb-4 text-gray-900 dark:text-white" itemProp="name">
            {recipe.name}
          </h1>
        </div>
      )}
    </header>
  );
}
