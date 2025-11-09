"use client";

import {
  Button,
  Card,
  CardBody,
  CardHeader,
  Checkbox,
  Image,
  Input,
  Select,
  SelectItem,
  Textarea
} from "@heroui/react";
import { useLingui } from "@lingui/react/macro";
import { Trans } from "@lingui/react/macro";
import { Upload, X } from "lucide-react";
import type { CreateRecipePayload } from "../../Domain/Schemas/Recipe.schema";

interface RecipeBasicInfoStepProps {
  formData: CreateRecipePayload;
  imagePreview: string | null;
  onFormDataChange: (data: Partial<CreateRecipePayload>) => void;
  onImageChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onImageRemove: () => void;
}

export const RecipeBasicInfoStep = ({
  formData,
  imagePreview,
  onFormDataChange,
  onImageChange,
  onImageRemove
}: RecipeBasicInfoStepProps) => {
  const { t } = useLingui();

  return (
    <Card>
      <CardHeader className="border-b border-divider bg-gray-50 dark:bg-gray-900 p-4 sm:p-6">
        <h2 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-gray-100">
          <Trans>Informations générales</Trans>
        </h2>
      </CardHeader>
      <CardBody className="space-y-4 sm:space-y-6 p-4 sm:p-6">
        <div>
          <p className="text-sm font-medium mb-2">
            <Trans>Image de couverture</Trans>
          </p>
          {imagePreview ? (
            <div className="relative w-full h-48 sm:h-64 rounded-large overflow-hidden">
              <Image src={imagePreview} alt="Preview" className="w-full h-full object-cover" removeWrapper />
              <Button
                isIconOnly
                color="danger"
                size="sm"
                variant="solid"
                onPress={onImageRemove}
                className="absolute top-2 right-2"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          ) : (
            <label className="flex flex-col items-center justify-center w-full h-48 sm:h-64 border-2 border-dashed border-default-300 rounded-large hover:border-primary cursor-pointer transition-colors">
              <Upload className="w-10 h-10 sm:w-12 sm:h-12 text-default-400 mb-2 sm:mb-3" />
              <p className="text-xs sm:text-sm text-default-600">
                <Trans>Cliquez pour ajouter une image</Trans>
              </p>
              <p className="text-xs text-default-400 mt-1">
                <Trans>PNG, JPG jusqu'à 10MB</Trans>
              </p>
              <input type="file" accept="image/*" onChange={onImageChange} className="hidden" />
            </label>
          )}
        </div>

        <Input
          label={<Trans>Nom de la recette</Trans>}
          placeholder={t`Ex: Tarte aux pommes`}
          value={formData.name}
          onValueChange={(value) => onFormDataChange({ name: value })}
          isRequired
          variant="bordered"
        />

        <Textarea
          label={<Trans>Description</Trans>}
          placeholder={t`Décrivez votre recette...`}
          value={formData.description}
          onValueChange={(value) => onFormDataChange({ description: value })}
          variant="bordered"
          minRows={3}
        />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Select
            label={<Trans>Difficulté</Trans>}
            selectedKeys={[formData.difficulty]}
            onSelectionChange={(keys) => {
              const value = Array.from(keys)[0] as string;
              onFormDataChange({ difficulty: value as any });
            }}
            variant="bordered"
          >
            <SelectItem key="EASY">
              <Trans>Facile</Trans>
            </SelectItem>
            <SelectItem key="MEDIUM">
              <Trans>Moyen</Trans>
            </SelectItem>
            <SelectItem key="HARD">
              <Trans>Difficile</Trans>
            </SelectItem>
          </Select>

          <Input
            label={<Trans>Préparation (min)</Trans>}
            type="number"
            value={formData.preparationTime.toString()}
            onValueChange={(value) => onFormDataChange({ preparationTime: Number.parseInt(value) || 1 })}
            isRequired
            min={1}
            variant="bordered"
          />

          <Input
            label={<Trans>Cuisson (min)</Trans>}
            type="number"
            value={formData.cookingTime.toString()}
            onValueChange={(value) => onFormDataChange({ cookingTime: Number.parseInt(value) || 1 })}
            isRequired
            min={1}
            variant="bordered"
          />
        </div>

        <div className="flex items-center gap-4">
          <Input
            label={<Trans>Nombre de personnes</Trans>}
            type="number"
            value={formData.servings.toString()}
            onValueChange={(value) => onFormDataChange({ servings: Number.parseInt(value) || 1 })}
            isRequired
            min={1}
            variant="bordered"
            className="flex-1"
          />

          <Checkbox
            isSelected={formData.isPublic}
            onValueChange={(checked) => onFormDataChange({ isPublic: checked })}
            className="mt-6"
          >
            <Trans>Rendre publique</Trans>
          </Checkbox>
        </div>
      </CardBody>
    </Card>
  );
};
