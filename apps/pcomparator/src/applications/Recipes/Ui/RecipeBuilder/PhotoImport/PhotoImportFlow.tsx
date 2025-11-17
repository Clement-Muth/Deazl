"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { useRecipeFromPhoto } from "../../../hooks/useRecipeFromPhoto";
import { PhotoCapture } from "./PhotoCapture";
import { PhotoPreview } from "./PhotoPreview";
import { RecipePreviewCard } from "./RecipePreviewCard";

export function PhotoImportFlow() {
  const router = useRouter();
  const { isAnalyzing, error, recipe, analyzePhoto, reset } = useRecipeFromPhoto();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const handlePhotoSelected = (file: File) => {
    setSelectedFile(file);
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
  };

  const handleAnalyze = async () => {
    if (selectedFile) {
      await analyzePhoto(selectedFile);
    }
  };

  const handleRemove = () => {
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }
    setSelectedFile(null);
    setPreviewUrl(null);
    reset();
  };

  const handleEdit = () => {};

  const handleSave = () => {
    router.push("/recipes");
  };

  return (
    <div className="max-w-2xl mx-auto space-y-4">
      {!selectedFile && <PhotoCapture onPhotoSelected={handlePhotoSelected} isDisabled={isAnalyzing} />}

      {selectedFile && previewUrl && !recipe && (
        <PhotoPreview
          imageUrl={previewUrl}
          isAnalyzing={isAnalyzing}
          onRemove={handleRemove}
          onAnalyze={handleAnalyze}
        />
      )}

      {error && (
        <div className="bg-danger-50 border border-danger-200 rounded-lg p-4">
          <p className="text-danger text-sm">{error}</p>
        </div>
      )}

      {recipe && <RecipePreviewCard recipe={recipe} onEdit={handleEdit} onSave={handleSave} />}
    </div>
  );
}
