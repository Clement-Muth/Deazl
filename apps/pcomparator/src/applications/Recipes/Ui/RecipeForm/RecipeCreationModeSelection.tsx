"use client";

import { Card, CardBody, CardHeader } from "@heroui/react";
import { Trans } from "@lingui/react/macro";
import { Camera, FileText, Link as LinkIcon, Sparkles } from "lucide-react";

export type RecipeCreationMode = "manual" | "photo" | "url" | "ai";

interface RecipeCreationModeSelectionProps {
  onModeSelected: (mode: RecipeCreationMode) => void;
}

export function RecipeCreationModeSelection({ onModeSelected }: RecipeCreationModeSelectionProps) {
  const modes = [
    {
      mode: "photo" as const,
      icon: Camera,
      title: <Trans>Import from Photo</Trans>,
      description: <Trans>Scan a recipe image to extract ingredients and steps automatically</Trans>,
      color: "primary" as const,
      available: true
    },
    {
      mode: "url" as const,
      icon: LinkIcon,
      title: <Trans>Import from URL</Trans>,
      description: <Trans>Paste a recipe link to import it automatically</Trans>,
      color: "secondary" as const,
      available: false
    },
    {
      mode: "ai" as const,
      icon: Sparkles,
      title: <Trans>Generate with AI</Trans>,
      description: <Trans>Create a recipe from constraints like budget, time, or ingredients</Trans>,
      color: "success" as const,
      available: false
    },
    {
      mode: "manual" as const,
      icon: FileText,
      title: <Trans>Create Manually</Trans>,
      description: <Trans>Fill out the form step by step</Trans>,
      color: "default" as const,
      available: true
    }
  ];

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-2">
          <Trans>How would you like to create your recipe?</Trans>
        </h2>
        <p className="text-default-500">
          <Trans>Choose the method that works best for you</Trans>
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {modes.map(({ mode, icon: Icon, title, description, color, available }) => (
          <Card
            key={mode}
            isPressable={available}
            onPress={() => available && onModeSelected(mode)}
            className={`${!available ? "opacity-50" : ""}`}
          >
            <CardHeader className="pb-2">
              <div className={`p-3 rounded-lg bg-${color}-100 dark:bg-${color}-900/20 mr-3`}>
                <Icon className={`w-6 h-6 text-${color}`} />
              </div>
              <div className="flex flex-col flex-1">
                <h3 className="text-lg font-semibold">{title}</h3>
                {!available && (
                  <span className="text-xs text-warning">
                    <Trans>Coming soon</Trans>
                  </span>
                )}
              </div>
            </CardHeader>
            <CardBody className="pt-0">
              <p className="text-sm text-default-500">{description}</p>
            </CardBody>
          </Card>
        ))}
      </div>
    </div>
  );
}
