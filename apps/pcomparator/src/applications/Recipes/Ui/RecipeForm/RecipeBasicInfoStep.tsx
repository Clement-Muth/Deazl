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
  SelectItem
} from "@heroui/react";
import { useLingui } from "@lingui/react/macro";
import { Trans } from "@lingui/react/macro";
import { Upload, X } from "lucide-react";
import type { CreateRecipePayload } from "../../Domain/Schemas/Recipe.schema";
import { AIDescriptionButton } from "./AIDescriptionButton";
import { RichTextEditor } from "./RichTextEditor";

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
          <Trans>General Information</Trans>
        </h2>
      </CardHeader>
      <CardBody className="space-y-4 sm:space-y-6 p-4 sm:p-6">
        <div>
          <p className="text-sm font-medium mb-2">
            <Trans>Cover Image</Trans>
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
                className="absolute top-2 right-2 z-10"
                aria-label={t`Remove image`}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          ) : (
            <label className="flex flex-col items-center justify-center w-full h-48 sm:h-64 border-2 border-dashed border-default-300 rounded-large hover:border-primary cursor-pointer transition-colors">
              <Upload className="w-10 h-10 sm:w-12 sm:h-12 text-default-400 mb-2 sm:mb-3" />
              <p className="text-xs sm:text-sm text-default-600">
                <Trans>Click to add an image</Trans>
              </p>
              <p className="text-xs text-gray-400">
                <Trans>PNG, JPG up to 10MB</Trans>
              </p>
              <input type="file" accept="image/*" onChange={onImageChange} className="hidden" />
            </label>
          )}
        </div>

        <Input
          label={<Trans>Recipe Name</Trans>}
          placeholder={t`Ex: Apple Pie`}
          value={formData.name}
          onValueChange={(value) => onFormDataChange({ name: value })}
          isRequired
        />

        <div className="space-y-2">
          <RichTextEditor
            label={t`Description`}
            placeholder={t`Write a detailed description of your recipe. Use formatting to make it clear and SEO-friendly.`}
            description={t`You can format text with bold, italic, headings, and lists for better readability and SEO.`}
            value={formData.description || ""}
            onChange={(value) => onFormDataChange({ description: value })}
          />
          <AIDescriptionButton
            formData={formData}
            onDescriptionGenerated={(desc) => onFormDataChange({ description: desc })}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Select
            label={<Trans>Difficulty</Trans>}
            defaultSelectedKeys={formData.difficulty ? [formData.difficulty] : []}
            onSelectionChange={(keys) => {
              const value = Array.from(keys)[0] as string;
              onFormDataChange({ difficulty: value as any });
            }}
            disallowEmptySelection
            isRequired
          >
            <SelectItem key="EASY">{t`Easy`}</SelectItem>
            <SelectItem key="MEDIUM">{t`Medium`}</SelectItem>
            <SelectItem key="HARD">{t`Hard`}</SelectItem>
          </Select>

          <Input
            label={<Trans>Preparation (min)</Trans>}
            type="number"
            value={formData.preparationTime?.toString() || ""}
            onValueChange={(value) => {
              const num = value === "" ? 0 : Number.parseInt(value);
              if (!Number.isNaN(num) && num >= 0) {
                onFormDataChange({ preparationTime: num || 0 });
              }
            }}
            isRequired
            min={0}
            placeholder="0"
          />

          <Input
            label={<Trans>Cooking (min)</Trans>}
            type="number"
            value={formData.cookingTime?.toString() || ""}
            onValueChange={(value) => {
              const num = value === "" ? 0 : Number.parseInt(value);
              if (!Number.isNaN(num) && num >= 0) {
                onFormDataChange({ cookingTime: num || 0 });
              }
            }}
            isRequired
            min={0}
            placeholder="0"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Select
            label={<Trans>Category</Trans>}
            placeholder={t`Select a category`}
            defaultSelectedKeys={formData.category ? [formData.category] : []}
            onSelectionChange={(keys) => {
              const value = Array.from(keys)[0] as string | undefined;
              onFormDataChange({ category: value });
            }}
          >
            <SelectItem key="appetizer">{t`Appetizer`}</SelectItem>
            <SelectItem key="main-course">{t`Main Course`}</SelectItem>
            <SelectItem key="dessert">{t`Dessert`}</SelectItem>
            <SelectItem key="side-dish">{t`Side Dish`}</SelectItem>
            <SelectItem key="salad">{t`Salad`}</SelectItem>
            <SelectItem key="soup">{t`Soup`}</SelectItem>
            <SelectItem key="breakfast">{t`Breakfast`}</SelectItem>
            <SelectItem key="snack">{t`Snack`}</SelectItem>
            <SelectItem key="beverage">{t`Beverage`}</SelectItem>
          </Select>

          <Select
            label={<Trans>Cuisine</Trans>}
            placeholder={t`Select a cuisine`}
            defaultSelectedKeys={formData.cuisine ? [formData.cuisine] : []}
            onSelectionChange={(keys) => {
              const value = Array.from(keys)[0] as string | undefined;
              onFormDataChange({ cuisine: value });
            }}
          >
            <SelectItem key="french">{t`French`}</SelectItem>
            <SelectItem key="italian">{t`Italian`}</SelectItem>
            <SelectItem key="asian">{t`Asian`}</SelectItem>
            <SelectItem key="mediterranean">{t`Mediterranean`}</SelectItem>
            <SelectItem key="american">{t`American`}</SelectItem>
            <SelectItem key="mexican">{t`Mexican`}</SelectItem>
            <SelectItem key="indian">{t`Indian`}</SelectItem>
            <SelectItem key="japanese">{t`Japanese`}</SelectItem>
            <SelectItem key="chinese">{t`Chinese`}</SelectItem>
            <SelectItem key="middle-eastern">{t`Middle Eastern`}</SelectItem>
            <SelectItem key="african">{t`African`}</SelectItem>
            <SelectItem key="fusion">{t`Fusion`}</SelectItem>
          </Select>
        </div>

        <div className="flex items-center gap-4">
          <Input
            label={<Trans>Number of Servings</Trans>}
            type="number"
            value={formData.servings?.toString() || ""}
            onValueChange={(value) => {
              const num = value === "" ? 0 : Number.parseInt(value);
              if (!Number.isNaN(num) && num >= 0) {
                onFormDataChange({ servings: num || 0 });
              }
            }}
            isRequired
            min={1}
            placeholder="1"
            className="flex-1"
          />

          <Checkbox
            isSelected={!formData.isPublic}
            onValueChange={(checked) => onFormDataChange({ isPublic: !checked })}
            className="mt-6"
          >
            <Trans>Make Private</Trans>
          </Checkbox>
        </div>
      </CardBody>
    </Card>
  );
};
