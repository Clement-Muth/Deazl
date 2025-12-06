"use client";

import { Card, CardBody, ScrollShadow, Skeleton } from "@heroui/react";
import { Trans } from "@lingui/react/macro";
import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";
import { useEffect, useState } from "react";
import type { RelatedRecipe } from "../../Api/recipes/getRelatedRecipes.api";
import { getRelatedRecipesCached } from "../../Api/recipes/getRelatedRecipes.api";
import type { RecipePayload } from "../../Domain/Schemas/Recipe.schema";
import { RecipeCard } from "./RecipeCard";

interface RelatedRecipesProps {
  recipeId: string;
  category?: string | null;
  cuisine?: string | null;
  tags?: string[];
}

export function RelatedRecipes({ recipeId, category, cuisine, tags }: RelatedRecipesProps) {
  const [recipes, setRecipes] = useState<RelatedRecipe[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRelated = async () => {
      try {
        const related = await getRelatedRecipesCached(recipeId, {
          category,
          cuisine,
          tags,
          limit: 6
        });
        setRecipes(related);
      } catch (error) {
        console.error("Failed to fetch related recipes:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchRelated();
  }, [recipeId, category, cuisine, tags]);

  if (!loading && recipes.length === 0) {
    return null;
  }

  return (
    <section className="mt-8" aria-labelledby="related-recipes-heading">
      <div className="flex items-center gap-2 mb-4">
        <Sparkles className="w-5 h-5 text-primary" />
        <h2 id="related-recipes-heading" className="text-lg font-bold">
          <Trans>You may also like</Trans>
        </h2>
      </div>

      {loading ? (
        <div className="flex gap-3 overflow-x-auto pb-4 -mx-4 px-4">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="w-[180px] shrink-0">
              <Skeleton className="w-full aspect-4/3 rounded-t-lg" />
              <CardBody className="space-y-2 p-3">
                <Skeleton className="w-3/4 h-4 rounded" />
                <Skeleton className="w-1/2 h-3 rounded" />
              </CardBody>
            </Card>
          ))}
        </div>
      ) : (
        <ScrollShadow orientation="horizontal" className="-mx-4 px-4" hideScrollBar>
          <div className="flex gap-3 pb-4">
            {recipes.map((recipe, index) => (
              <motion.div
                key={recipe.id}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
                className="w-[180px] shrink-0"
              >
                <RecipeCard recipe={recipe as unknown as RecipePayload} variant="minimal" isCompact />
              </motion.div>
            ))}
          </div>
        </ScrollShadow>
      )}
    </section>
  );
}
