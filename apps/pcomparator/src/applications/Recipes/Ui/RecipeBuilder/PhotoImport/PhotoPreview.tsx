"use client";

import { Button } from "@heroui/button";
import { Card, CardBody } from "@heroui/card";
import { Spinner } from "@heroui/spinner";
import { Trans } from "@lingui/react/macro";
import { X } from "lucide-react";
import Image from "next/image";

interface PhotoPreviewProps {
  imageUrl: string;
  isAnalyzing: boolean;
  onRemove: () => void;
  onAnalyze: () => void;
}

export function PhotoPreview({ imageUrl, isAnalyzing, onRemove, onAnalyze }: PhotoPreviewProps) {
  return (
    <Card>
      <CardBody className="p-4">
        <div className="relative w-full aspect-video">
          <Image src={imageUrl} alt="Recipe preview" fill className="object-contain rounded-lg" />

          {!isAnalyzing && (
            <Button
              isIconOnly
              size="sm"
              color="danger"
              variant="flat"
              className="absolute top-2 right-2"
              onPress={onRemove}
            >
              <X size={16} />
            </Button>
          )}
        </div>

        <div className="mt-4 flex gap-2">
          {isAnalyzing ? (
            <div className="flex items-center gap-2 w-full justify-center py-2">
              <Spinner size="sm" />
              <span className="text-sm">
                <Trans>Analyzing recipe...</Trans>
              </span>
            </div>
          ) : (
            <Button color="primary" className="w-full" onPress={onAnalyze}>
              <Trans>Analyze Recipe</Trans>
            </Button>
          )}
        </div>
      </CardBody>
    </Card>
  );
}
