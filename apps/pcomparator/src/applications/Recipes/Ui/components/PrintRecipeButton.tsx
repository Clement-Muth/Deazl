"use client";

import { Button } from "@heroui/react";
import { useLingui } from "@lingui/react/macro";
import { Printer } from "lucide-react";
import { useCallback } from "react";
import type { RecipePayload } from "../../Domain/Schemas/Recipe.schema";

interface PrintRecipeButtonProps {
  recipe: RecipePayload;
  scaleFactor?: number;
}

export function PrintRecipeButton({ recipe, scaleFactor = 1 }: PrintRecipeButtonProps) {
  const { t } = useLingui();

  const handlePrint = useCallback(() => {
    const printWindow = window.open("", "_blank");
    if (!printWindow) return;

    const ingredients =
      recipe.ingredientGroups && recipe.ingredientGroups.length > 0
        ? recipe.ingredientGroups
            .sort((a, b) => a.order - b.order)
            .map(
              (group) => `
          <div class="ingredient-group">
            <h3>${group.name}</h3>
            <ul>
              ${group.ingredients
                .sort((a, b) => a.order - b.order)
                .map(
                  (ing) => `
                <li>${(ing.quantity * scaleFactor).toFixed(ing.quantity * scaleFactor < 1 ? 2 : 1)} ${ing.unit} ${ing.productName || ""}</li>
              `
                )
                .join("")}
            </ul>
          </div>
        `
            )
            .join("")
        : `<ul>${(recipe.ingredients || [])
            .map(
              (ing) => `
          <li>${(ing.quantity * scaleFactor).toFixed(ing.quantity * scaleFactor < 1 ? 2 : 1)} ${ing.unit} ${ing.productName || ""}</li>
        `
            )
            .join("")}</ul>`;

    const steps =
      recipe.stepGroups && recipe.stepGroups.length > 0
        ? recipe.stepGroups
            .sort((a, b) => a.order - b.order)
            .map(
              (group) => `
          <div class="step-group">
            <h3>${group.name}</h3>
            <ol>
              ${group.steps
                .sort((a, b) => a.stepNumber - b.stepNumber)
                .map(
                  (step) => `
                <li>
                  ${step.description}
                  ${step.duration ? `<span class="duration">(${step.duration} min)</span>` : ""}
                </li>
              `
                )
                .join("")}
            </ol>
          </div>
        `
            )
            .join("")
        : `<ol>${(recipe.steps || [])
            .sort((a, b) => a.stepNumber - b.stepNumber)
            .map(
              (step) => `
          <li>
            ${step.description}
            ${step.duration ? `<span class="duration">(${step.duration} min)</span>` : ""}
          </li>
        `
            )
            .join("")}</ol>`;

    const difficultyLabels: Record<string, string> = {
      EASY: "Easy",
      MEDIUM: "Medium",
      HARD: "Hard"
    };

    const formatTime = (minutes: number): string => {
      if (minutes < 60) return `${minutes} min`;
      const h = Math.floor(minutes / 60);
      const m = minutes % 60;
      return m > 0 ? `${h}h ${m}min` : `${h}h`;
    };

    const cleanDescription = recipe.description?.replace(/<[^>]*>/g, "") || "";

    const printContent = `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <title>${recipe.name} - Deazl Recipe</title>
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body { 
            font-family: Georgia, 'Times New Roman', serif; 
            max-width: 800px; 
            margin: 0 auto; 
            padding: 20px;
            line-height: 1.6;
            color: #333;
          }
          header { 
            text-align: center; 
            border-bottom: 2px solid #f97316; 
            padding-bottom: 20px;
            margin-bottom: 24px;
          }
          h1 { 
            font-size: 28px; 
            margin-bottom: 8px;
            color: #1a1a1a;
          }
          .meta { 
            display: flex; 
            justify-content: center; 
            gap: 24px; 
            font-size: 14px;
            color: #666;
            flex-wrap: wrap;
          }
          .meta span { display: flex; align-items: center; gap: 4px; }
          .description {
            font-style: italic;
            color: #555;
            margin-top: 12px;
            font-size: 14px;
          }
          section { margin-bottom: 24px; }
          h2 { 
            font-size: 20px; 
            color: #f97316;
            margin-bottom: 12px;
            padding-bottom: 4px;
            border-bottom: 1px solid #f97316;
          }
          h3 { 
            font-size: 16px; 
            color: #444;
            margin: 12px 0 8px 0;
          }
          ul, ol { margin-left: 20px; }
          li { margin-bottom: 8px; }
          .ingredient-group { margin-bottom: 16px; }
          .step-group { margin-bottom: 16px; }
          .duration { 
            color: #f97316; 
            font-size: 12px;
            font-style: italic;
          }
          footer {
            margin-top: 32px;
            padding-top: 16px;
            border-top: 1px solid #ddd;
            text-align: center;
            font-size: 12px;
            color: #999;
          }
          @media print {
            body { padding: 0; }
            @page { margin: 1.5cm; }
          }
        </style>
      </head>
      <body>
        <header>
          <h1>${recipe.name}</h1>
          <div class="meta">
            <span>⏱️ ${formatTime(recipe.preparationTime)} prep</span>
            <span>🔥 ${formatTime(recipe.cookingTime)} cooking</span>
            <span>👥 ${Math.round(recipe.servings * scaleFactor)} servings</span>
            <span>📊 ${difficultyLabels[recipe.difficulty]}</span>
          </div>
          ${cleanDescription ? `<p class="description">${cleanDescription}</p>` : ""}
        </header>

        <section>
          <h2>Ingredients</h2>
          ${ingredients}
        </section>

        <section>
          <h2>Instructions</h2>
          ${steps}
        </section>

        <footer>
          <p>Recipe from Deazl - deazl.app</p>
          <p>Printed on ${new Date().toLocaleDateString()}</p>
        </footer>
      </body>
      </html>
    `;

    printWindow.document.write(printContent);
    printWindow.document.close();
    printWindow.focus();

    setTimeout(() => {
      printWindow.print();
    }, 250);
  }, [recipe, scaleFactor]);

  return (
    <Button
      size="md"
      variant="flat"
      startContent={<Printer className="w-4 h-4" />}
      onPress={handlePrint}
      aria-label={t`Print recipe`}
      className="min-w-11 min-h-11 touch-manipulation"
    >
      <span className="hidden sm:inline">{t`Print`}</span>
    </Button>
  );
}
