"use client";

import { Button } from "@heroui/button";
import { Card, CardBody, CardHeader } from "@heroui/card";
import { Chip } from "@heroui/chip";
import { Divider } from "@heroui/divider";
import { Trans } from "@lingui/react/macro";
import { ChefHat, Clock, Users } from "lucide-react";
import type { RecipeDraft } from "../../../Domain/Schemas/RecipeDraft.schema";

interface RecipePreviewCardProps {
  recipe: Partial<RecipeDraft>;
  onEdit: () => void;
  onSave: () => void;
}

export function RecipePreviewCard({ recipe, onEdit, onSave }: RecipePreviewCardProps) {
  return (
    <Card>
      <CardHeader className="flex flex-col items-start gap-2 pb-2">
        <h2 className="text-xl font-bold">{recipe.name || <Trans>Untitled Recipe</Trans>}</h2>
        {recipe.subtitle && <p className="text-sm text-default-500">{recipe.subtitle}</p>}
      </CardHeader>

      <Divider />

      <CardBody className="gap-4">
        <div className="flex flex-wrap gap-2">
          {recipe.servings && (
            <Chip startContent={<Users size={14} />} variant="flat" size="sm">
              {recipe.servings} <Trans>servings</Trans>
            </Chip>
          )}

          {recipe.preparationTime && (
            <Chip startContent={<Clock size={14} />} variant="flat" size="sm">
              <Trans>Prep</Trans>: {recipe.preparationTime} min
            </Chip>
          )}

          {recipe.cookingTime && (
            <Chip startContent={<Clock size={14} />} variant="flat" size="sm">
              <Trans>Cook</Trans>: {recipe.cookingTime} min
            </Chip>
          )}

          {recipe.difficulty && (
            <Chip
              startContent={<ChefHat size={14} />}
              variant="flat"
              size="sm"
              color={
                recipe.difficulty === "EASY"
                  ? "success"
                  : recipe.difficulty === "MEDIUM"
                    ? "warning"
                    : "danger"
              }
            >
              {recipe.difficulty}
            </Chip>
          )}
        </div>

        {recipe.ingredients && recipe.ingredients.length > 0 && (
          <div>
            <h3 className="font-semibold mb-2">
              <Trans>Ingredients</Trans> ({recipe.ingredients.length})
            </h3>
            <ul className="list-disc list-inside space-y-1 text-sm">
              {recipe.ingredients.slice(0, 5).map((ing, idx) => (
                <li key={idx}>
                  {ing.quantity && `${ing.quantity} `}
                  {ing.unit && `${ing.unit} `}
                  {ing.productName}
                </li>
              ))}
              {recipe.ingredients.length > 5 && (
                <li className="text-default-500">
                  <Trans>+{recipe.ingredients.length - 5} more</Trans>
                </li>
              )}
            </ul>
          </div>
        )}

        {recipe.steps && recipe.steps.length > 0 && (
          <div>
            <h3 className="font-semibold mb-2">
              <Trans>Steps</Trans> ({recipe.steps.length})
            </h3>
            <div className="space-y-2">
              {recipe.steps.slice(0, 3).map((step, idx) => (
                <div key={idx} className="flex gap-2 text-sm">
                  <span className="font-semibold text-primary">{step.stepNumber}.</span>
                  <p className="line-clamp-2">{step.description}</p>
                </div>
              ))}
              {recipe.steps.length > 3 && (
                <p className="text-sm text-default-500">
                  <Trans>+{recipe.steps.length - 3} more steps</Trans>
                </p>
              )}
            </div>
          </div>
        )}

        <div className="flex gap-2 mt-4">
          <Button color="default" variant="bordered" className="flex-1" onPress={onEdit}>
            <Trans>Edit Details</Trans>
          </Button>

          <Button color="primary" className="flex-1" onPress={onSave}>
            <Trans>Save Recipe</Trans>
          </Button>
        </div>
      </CardBody>
    </Card>
  );
}
