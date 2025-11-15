"use client";

import { Button } from "@heroui/button";
import { Card } from "@heroui/card";
import { Trans } from "@lingui/react/macro";
import { Camera, Image as ImageIcon } from "lucide-react";
import { useRef } from "react";

interface PhotoCaptureProps {
  onPhotoSelected: (file: File) => void;
  isDisabled?: boolean;
}

export function PhotoCapture({ onPhotoSelected, isDisabled = false }: PhotoCaptureProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file?.type.startsWith("image/")) {
      onPhotoSelected(file);
    }
  };

  return (
    <Card className="p-6">
      <div className="flex flex-col gap-4">
        <h3 className="text-lg font-semibold">
          <Trans>Import a recipe from a photo</Trans>
        </h3>

        <p className="text-sm text-default-500">
          <Trans>Take a photo or select an image of your recipe</Trans>
        </p>

        <div className="flex flex-col sm:flex-row gap-3">
          <Button
            color="primary"
            variant="flat"
            startContent={<Camera size={20} />}
            onPress={() => cameraInputRef.current?.click()}
            isDisabled={isDisabled}
            className="flex-1"
          >
            <Trans>Take Photo</Trans>
          </Button>

          <Button
            color="primary"
            variant="bordered"
            startContent={<ImageIcon size={20} />}
            onPress={() => fileInputRef.current?.click()}
            isDisabled={isDisabled}
            className="flex-1"
          >
            <Trans>Choose from Gallery</Trans>
          </Button>
        </div>

        <input
          ref={cameraInputRef}
          type="file"
          accept="image/*"
          capture="environment"
          onChange={handleFileChange}
          className="hidden"
        />

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          className="hidden"
        />
      </div>
    </Card>
  );
}
