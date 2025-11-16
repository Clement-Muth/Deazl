"use client";

import type { RecipePayload } from "~/applications/Recipes/Domain/Schemas/Recipe.schema";
import { RecipeFormEdit } from "~/applications/Recipes/Ui";

interface RecipeEditPageClientProps {
  recipe: RecipePayload;
}

export function RecipeEditPageClient({ recipe }: RecipeEditPageClientProps) {
  return (
    <main className="flex w-full justify-center p-4">
      <div className="flex flex-col gap-y-8 max-w-4xl w-full">
        <RecipeFormEdit recipe={recipe} />
      </div>
    </main>
  );
}
