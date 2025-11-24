"use client";

import { Divider } from "@heroui/react";
import { Trans } from "@lingui/react/macro";
import { motion } from "framer-motion";
import { Clock, Users } from "lucide-react";
import { RichTextDisplay } from "../components/RichTextDisplay";

interface RecipeDetailsMobileDescriptionProps {
  recipe: {
    name: string;
    totalTime: number;
    servings: number;
    description?: string | null;
  };
}

export default function RecipeDetailsMobileDescription({ recipe }: RecipeDetailsMobileDescriptionProps) {
  const formatTime = (totalMinutes: number): string => {
    if (totalMinutes < 60) {
      return `${totalMinutes} Min`;
    }

    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;

    if (hours < 24) {
      if (minutes === 0) {
        return `${hours}h`;
      }
      return `${hours}h ${minutes.toString().padStart(2, "0")}min`;
    }

    // Plus de 24h : afficher en jours + heures + minutes
    const days = Math.floor(hours / 24);
    const remainingHours = hours % 24;

    if (remainingHours === 0 && minutes === 0) {
      return `${days}j`;
    } else if (remainingHours === 0) {
      return `${days}j ${minutes.toString().padStart(2, "0")}min`;
    } else if (minutes === 0) {
      return `${days}j ${remainingHours}h`;
    } else {
      return `${days}j ${remainingHours}h ${minutes.toString().padStart(2, "0")}min`;
    }
  };

  const formattedTime = formatTime(recipe.totalTime);

  return (
    <div className="-mt-8 relative z-20">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
        className="rounded-t-4xl bg-background pt-8 px-4 space-y-4"
      >
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="text-3xl md:text-4xl font-black drop-shadow-2xl"
        >
          {recipe.name}
        </motion.h1>

        <div className="flex justify-center gap-8 mb-6 bg-orange-100 rounded-2xl p-4">
          <div className="flex items-center gap-4">
            <Clock className="w-10 h-10 text-orange-300" />
            <div>
              <p className="text-sm font-bold text-foreground-500">{formattedTime}</p>
              <p className="text-sm text-foreground-500">
                <Trans>Cooking</Trans>
              </p>
            </div>
          </div>

          <Divider orientation="vertical" className="h-7" />

          <div className="flex items-center gap-4">
            <Users className="w-10 h-10 text-orange-300" />
            <div>
              <p className="text-sm font-bold text-foreground-500">{recipe.servings} Bowl</p>
              <p className="text-sm text-foreground-500">
                <Trans>Servings</Trans>
              </p>
            </div>
          </div>
        </div>

        {recipe.description && (
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-3">
              <Trans>Description</Trans>
            </h3>
            <RichTextDisplay content={recipe.description} />
          </div>
        )}
      </motion.div>
    </div>
  );
}
