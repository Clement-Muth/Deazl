import { RecipeFormCreate } from "~/applications/Recipes/Ui";

export default async function NewRecipePage() {
  return (
    <main className="flex w-full justify-center p-4">
      <div className="flex flex-col gap-y-8 max-w-4xl w-full">
        <RecipeFormCreate />
      </div>
    </main>
  );
}
