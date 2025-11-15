import { PhotoImportFlow } from "~/applications/Recipes/Ui/RecipeBuilder/PhotoImport";

export default function RecipeBuilderPhotoPage() {
  return (
    <div className="container mx-auto p-4 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Create Recipe from Photo</h1>
        <p className="text-default-500 mt-2">
          Take a photo or upload an image of your recipe to extract ingredients and steps automatically
        </p>
      </div>

      <PhotoImportFlow />
    </div>
  );
}
