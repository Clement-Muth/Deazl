"use client";

import { Trans } from "@lingui/react/macro";
import { motion } from "framer-motion";
import { ChefHat, Clock, Flame, Gauge, Users } from "lucide-react";
import { RecipeBreadcrumb } from "../components";
import { RichTextDisplay } from "../components/RichTextDisplay";

interface RecipeDetailsMobileDescriptionProps {
  recipe: {
    name: string;
    category?: string | null;
    cuisine?: string | null;
    totalTime: number;
    servings: number;
    description?: string | null;
    preparationTime?: number;
    cookingTime?: number;
    difficulty?: string;
  };
}

export default function RecipeDetailsMobileDescription({ recipe }: RecipeDetailsMobileDescriptionProps) {
  const formatTime = (totalMinutes: number): string => {
    if (totalMinutes < 60) {
      return `${totalMinutes} min`;
    }

    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;

    if (hours < 24) {
      if (minutes === 0) {
        return `${hours}h`;
      }
      return `${hours}h ${minutes}min`;
    }

    const days = Math.floor(hours / 24);
    const remainingHours = hours % 24;

    if (remainingHours === 0 && minutes === 0) {
      return `${days}d`;
    }
    if (remainingHours === 0) {
      return `${days}d ${minutes}min`;
    }
    if (minutes === 0) {
      return `${days}d ${remainingHours}h`;
    }
    return `${days}d ${remainingHours}h ${minutes}min`;
  };

  const formatISODuration = (minutes: number): string => {
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;
    if (h > 0 && m > 0) return `PT${h}H${m}M`;
    if (h > 0) return `PT${h}H`;
    return `PT${m}M`;
  };

  const getDifficultyColors = (difficulty?: string) => {
    switch (difficulty) {
      case "EASY":
        return { bg: "bg-success/10", text: "text-success" };
      case "MEDIUM":
        return { bg: "bg-warning/10", text: "text-warning" };
      case "HARD":
        return { bg: "bg-danger/10", text: "text-danger" };
      default:
        return { bg: "bg-default/10", text: "text-default-500" };
    }
  };

  const getDifficultyLabel = (difficulty?: string) => {
    switch (difficulty) {
      case "EASY":
        return <Trans>Easy</Trans>;
      case "MEDIUM":
        return <Trans>Medium</Trans>;
      case "HARD":
        return <Trans>Hard</Trans>;
      default:
        return <Trans>Easy</Trans>;
    }
  };

  const difficultyColors = getDifficultyColors(recipe.difficulty);

  return (
    <div className="-mt-8 relative z-20">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
        className="rounded-t-4xl bg-background pt-8 px-4 space-y-5"
      >
        <div className="lg:px-4">
          <RecipeBreadcrumb recipeName={recipe.name} category={recipe.category} cuisine={recipe.cuisine} />
        </div>
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="text-2xl sm:text-3xl md:text-4xl font-black leading-tight"
          itemProp="name"
        >
          {recipe.name}
        </motion.h1>

        <ul
          className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 list-none p-0 m-0"
          aria-label="Recipe information"
        >
          <li className="flex items-center gap-3 p-3 rounded-xl bg-content2">
            <div className="flex items-center justify-center w-10 h-10 rounded-full bg-primary/10">
              <Clock className="w-5 h-5 text-primary" aria-hidden="true" />
            </div>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-foreground truncate">
                <time itemProp="totalTime" dateTime={formatISODuration(recipe.totalTime)}>
                  {formatTime(recipe.totalTime)}
                </time>
              </p>
              <p className="text-xs text-foreground-500">
                <Trans>Total time</Trans>
              </p>
            </div>
          </li>

          <li className="flex items-center gap-3 p-3 rounded-xl bg-content2">
            <div className="flex items-center justify-center w-10 h-10 rounded-full bg-secondary/10">
              <Users className="w-5 h-5 text-secondary" aria-hidden="true" />
            </div>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-foreground">
                <span itemProp="recipeYield">{recipe.servings}</span>
              </p>
              <p className="text-xs text-foreground-500">
                <Trans>Servings</Trans>
              </p>
            </div>
          </li>

          {recipe.difficulty && (
            <li className="flex items-center gap-3 p-3 rounded-xl bg-content2">
              <div
                className={`flex items-center justify-center w-10 h-10 rounded-full ${difficultyColors.bg}`}
              >
                <Gauge className={`w-5 h-5 ${difficultyColors.text}`} aria-hidden="true" />
              </div>
              <div className="min-w-0">
                <p className={`text-sm font-semibold ${difficultyColors.text}`}>
                  {getDifficultyLabel(recipe.difficulty)}
                </p>
                <p className="text-xs text-foreground-500">
                  <Trans>Difficulty</Trans>
                </p>
              </div>
            </li>
          )}

          {recipe.preparationTime && (
            <li className="flex items-center gap-3 p-3 rounded-xl bg-content2">
              <div className="flex items-center justify-center w-10 h-10 rounded-full bg-success/10">
                <ChefHat className="w-5 h-5 text-success" aria-hidden="true" />
              </div>
              <div className="min-w-0">
                <p className="text-sm font-semibold text-foreground truncate">
                  <time itemProp="prepTime" dateTime={formatISODuration(recipe.preparationTime)}>
                    {formatTime(recipe.preparationTime)}
                  </time>
                </p>
                <p className="text-xs text-foreground-500">
                  <Trans>Prep</Trans>
                </p>
              </div>
            </li>
          )}

          {recipe.cookingTime && (
            <li className="flex items-center gap-3 p-3 rounded-xl bg-content2">
              <div className="flex items-center justify-center w-10 h-10 rounded-full bg-warning/10">
                <Flame className="w-5 h-5 text-warning" aria-hidden="true" />
              </div>
              <div className="min-w-0">
                <p className="text-sm font-semibold text-foreground truncate">
                  <time itemProp="cookTime" dateTime={formatISODuration(recipe.cookingTime)}>
                    {formatTime(recipe.cookingTime)}
                  </time>
                </p>
                <p className="text-xs text-foreground-500">
                  <Trans>Cook</Trans>
                </p>
              </div>
            </li>
          )}
        </ul>

        {recipe.description && (
          <div>
            <h2
              className="text-xs font-bold uppercase tracking-wider text-foreground-500 mb-2"
              id="description-heading"
            >
              <Trans>Description</Trans>
            </h2>
            <div itemProp="description" className="text-sm text-foreground-600 leading-relaxed">
              <RichTextDisplay content={recipe.description} />
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
}
