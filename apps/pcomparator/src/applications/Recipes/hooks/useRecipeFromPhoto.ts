"use client";

import { useState } from "react";
import { analyzeRecipePhoto } from "../Api/recipeBuilder/analyzeRecipePhoto.api";
import type { RecipeDraft } from "../Domain/Schemas/RecipeDraft.schema";

interface UseRecipeFromPhotoResult {
  isAnalyzing: boolean;
  error: string | null;
  recipe: Partial<RecipeDraft> | null;
  analyzePhoto: (file: File) => Promise<void>;
  reset: () => void;
}

function compressImage(file: File, maxSizeMB = 1.5, maxWidthOrHeight = 1600): Promise<File> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target?.result as string;
      img.onload = () => {
        const canvas = document.createElement("canvas");
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > maxWidthOrHeight) {
            height = (height * maxWidthOrHeight) / width;
            width = maxWidthOrHeight;
          }
        } else {
          if (height > maxWidthOrHeight) {
            width = (width * maxWidthOrHeight) / height;
            height = maxWidthOrHeight;
          }
        }

        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext("2d");
        if (!ctx) {
          reject(new Error("Failed to get canvas context"));
          return;
        }

        ctx.drawImage(img, 0, 0, width, height);

        let quality = 0.7;
        const tryCompress = () => {
          canvas.toBlob(
            (blob) => {
              if (!blob) {
                reject(new Error("Failed to compress image"));
                return;
              }

              const sizeMB = blob.size / 1024 / 1024;

              if (sizeMB > maxSizeMB && quality > 0.2) {
                quality -= 0.05;
                tryCompress();
              } else {
                if (sizeMB > 2) {
                  console.warn(`Warning: Compressed image is ${sizeMB.toFixed(2)}MB, might be too large`);
                }
                const compressedFile = new File([blob], file.name, {
                  type: "image/jpeg",
                  lastModified: Date.now()
                });
                resolve(compressedFile);
              }
            },
            "image/jpeg",
            quality
          );
        };

        tryCompress();
      };
      img.onerror = () => reject(new Error("Failed to load image"));
    };
    reader.onerror = () => reject(new Error("Failed to read file"));
  });
}

function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      if (!result) {
        reject(new Error("Failed to read file"));
        return;
      }
      const base64 = result.split(",")[1];
      if (!base64 || base64.length === 0) {
        reject(new Error("Invalid base64 encoding"));
        return;
      }
      resolve(base64);
    };
    reader.onerror = () => reject(new Error("Failed to read file"));
    reader.readAsDataURL(file);
  });
}

export function useRecipeFromPhoto(): UseRecipeFromPhotoResult {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [recipe, setRecipe] = useState<Partial<RecipeDraft> | null>(null);

  const analyzePhoto = async (file: File) => {
    setIsAnalyzing(true);
    setError(null);
    setRecipe(null);

    try {
      const compressedFile = await compressImage(file);
      const base64 = await fileToBase64(compressedFile);
      const result = await analyzeRecipePhoto(base64);

      if (result.success && result.recipe) {
        setRecipe(result.recipe);
      } else {
        const errorMsg = result.error || "Failed to analyze photo";
        console.error("Analysis failed:", errorMsg);
        setError(errorMsg);
      }
    } catch (err: any) {
      console.error("Error analyzing photo:", err);
      if (err.message?.includes("JSON")) {
        setError("Image upload failed. The file might be too large. Please try a different photo.");
      } else {
        setError(err.message || "An unexpected error occurred");
      }
    } finally {
      setIsAnalyzing(false);
    }
  };

  const reset = () => {
    setIsAnalyzing(false);
    setError(null);
    setRecipe(null);
  };

  return {
    isAnalyzing,
    error,
    recipe,
    analyzePhoto,
    reset
  };
}
