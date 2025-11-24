"use client";

import { Button, Card, CardBody, CardHeader, Divider, Input, Select, SelectItem } from "@heroui/react";
import { useLingui } from "@lingui/react/macro";
import { Trans } from "@lingui/react/macro";
import { FolderIcon, ListIcon, Plus, Trash2, X } from "lucide-react";
import { useState } from "react";
import { UnitType } from "~/applications/ShoppingLists/Domain/ValueObjects/Unit.vo";
import type { ProductSearchResult } from "../../Api/products/searchProducts.api";
import type { CreateRecipePayload } from "../../Domain/Schemas/Recipe.schema";
import { ModeToggleHelp } from "./ModeToggleHelp";
import { SmartIngredientInput } from "./SmartIngredientInput";

interface IngredientGroup {
  name: string;
  order: number;
  ingredients: Array<{
    productId: string;
    productName?: string;
    quantity: number;
    unit: string;
    order: number;
  }>;
}

interface RecipeIngredientsStepProps {
  ingredients: CreateRecipePayload["ingredients"];
  ingredientGroups?: IngredientGroup[];
  onAddIngredient: () => void;
  onRemoveIngredient: (index: number) => void;
  onUpdateIngredient: (index: number, field: string, value: any) => void;
  onGroupsChange?: (groups: IngredientGroup[]) => void;
}

export const RecipeIngredientsStep = ({
  ingredients,
  ingredientGroups: initialGroups,
  onAddIngredient,
  onRemoveIngredient,
  onUpdateIngredient,
  onGroupsChange
}: RecipeIngredientsStepProps) => {
  const { t } = useLingui();
  const [useGroups, setUseGroups] = useState(!!initialGroups && initialGroups.length > 0);
  const [groups, setGroups] = useState<IngredientGroup[]>(
    initialGroups && initialGroups.length > 0 ? initialGroups : [{ name: "", order: 0, ingredients: [] }]
  );

  const unitOptions = [
    { value: UnitType.UNIT, label: t`Unit` },
    { value: UnitType.PIECE, label: t`Piece` },
    { value: UnitType.G, label: t`Grams (g)` },
    { value: UnitType.KG, label: t`Kilograms (kg)` },
    { value: UnitType.ML, label: t`Milliliters (ml)` },
    { value: UnitType.CL, label: t`Centiliters (cl)` },
    { value: UnitType.L, label: t`Liters (l)` },
    { value: UnitType.TEASPOON, label: t`Teaspoon (tsp)` },
    { value: UnitType.TABLESPOON, label: t`Tablespoon (tbsp)` },
    { value: UnitType.CUP, label: t`Cup` },
    { value: UnitType.PINCH, label: t`Pinch` }
  ];

  const handleProductSelect = (index: number, product: ProductSearchResult) => {
    const updatedIngredients = [...(ingredients || [])];
    updatedIngredients[index] = {
      ...updatedIngredients[index],
      productId: product.id,
      productName: product.name
    };
    onUpdateIngredient(index, "_batch", updatedIngredients[index]);
  };

  const handleToggleMode = () => {
    if (!useGroups) {
      // Switching to group mode - clear simple ingredients
      if (onGroupsChange) {
        onGroupsChange([{ name: "", order: 0, ingredients: [] }]);
      }
      setGroups([{ name: "", order: 0, ingredients: [] }]);
      // Clear simple ingredients by removing each one
      const count = ingredients?.length || 0;
      for (let i = count - 1; i >= 0; i--) {
        onRemoveIngredient(i);
      }
    } else {
      // Switching to simple mode - clear groups
      if (onGroupsChange) {
        onGroupsChange([]);
      }
      setGroups([]);
      // Add one empty ingredient
      if (!ingredients || ingredients.length === 0) {
        onAddIngredient();
      }
    }
    setUseGroups(!useGroups);
  };

  const handleAddGroup = () => {
    const newGroups = [...groups, { name: "", order: groups.length, ingredients: [] }];
    setGroups(newGroups);
    if (onGroupsChange) onGroupsChange(newGroups);
  };

  const handleRemoveGroup = (groupIndex: number) => {
    if (groups.length === 1) return; // Keep at least one group
    const newGroups = groups.filter((_, idx) => idx !== groupIndex);
    setGroups(newGroups);
    if (onGroupsChange) onGroupsChange(newGroups);
  };

  const handleUpdateGroupName = (groupIndex: number, name: string) => {
    const newGroups = [...groups];
    newGroups[groupIndex].name = name;
    setGroups(newGroups);
    if (onGroupsChange) onGroupsChange(newGroups);
  };

  const handleAddIngredientToGroup = (groupIndex: number) => {
    const newGroups = [...groups];
    newGroups[groupIndex].ingredients.push({
      productId: "",
      productName: "",
      quantity: 1,
      unit: "unit",
      order: newGroups[groupIndex].ingredients.length
    });
    setGroups(newGroups);
    if (onGroupsChange) onGroupsChange(newGroups);
  };

  const handleRemoveIngredientFromGroup = (groupIndex: number, ingIndex: number) => {
    const newGroups = [...groups];
    newGroups[groupIndex].ingredients = newGroups[groupIndex].ingredients.filter(
      (_, idx) => idx !== ingIndex
    );
    setGroups(newGroups);
    if (onGroupsChange) onGroupsChange(newGroups);
  };

  const handleUpdateIngredientInGroup = (groupIndex: number, ingIndex: number, field: string, value: any) => {
    const newGroups = [...groups];
    if (field === "product") {
      newGroups[groupIndex].ingredients[ingIndex] = {
        ...newGroups[groupIndex].ingredients[ingIndex],
        productId: value.id,
        productName: value.name
      };
    } else {
      newGroups[groupIndex].ingredients[ingIndex] = {
        ...newGroups[groupIndex].ingredients[ingIndex],
        [field]: value
      };
    }
    setGroups(newGroups);
    if (onGroupsChange) onGroupsChange(newGroups);
  };

  return (
    <Card>
      <CardHeader className="border-b border-divider bg-gray-50 dark:bg-gray-900 p-4 sm:p-6">
        <div className="flex items-center justify-between w-full">
          <h2 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-gray-100">
            <Trans>Ingredients</Trans>
          </h2>
          <Button
            variant={useGroups ? "solid" : "bordered"}
            color="primary"
            onPress={handleToggleMode}
            startContent={useGroups ? <FolderIcon className="w-4 h-4" /> : <ListIcon className="w-4 h-4" />}
            size="sm"
            className="min-w-32"
          >
            {useGroups ? <Trans>Organized</Trans> : <Trans>Simple List</Trans>}
          </Button>
        </div>
      </CardHeader>
      <CardBody className="p-4 sm:p-6">
        <ModeToggleHelp type="ingredients" isGroupMode={useGroups} />
        {useGroups ? (
          <div className="space-y-6">
            {groups.map((group, groupIndex) => (
              <Card key={groupIndex} className="p-4 bg-default-50">
                <div className="flex items-center gap-2 mb-4">
                  <Input
                    label={<Trans>Group Name</Trans>}
                    placeholder={t`e.g., Dough, Filling, Sauce`}
                    value={group.name}
                    onValueChange={(value) => handleUpdateGroupName(groupIndex, value)}
                    className="flex-1"
                    isRequired
                    variant="bordered"
                  />
                  {groups.length > 1 && (
                    <Button
                      isIconOnly
                      color="danger"
                      variant="light"
                      onPress={() => handleRemoveGroup(groupIndex)}
                      size="lg"
                    >
                      <Trash2 className="w-5 h-5" />
                    </Button>
                  )}
                </div>

                <Divider className="my-4" />

                <div className="space-y-3">
                  {group.ingredients.map((ingredient, ingIndex) => (
                    <div
                      key={ingIndex}
                      className="flex flex-col gap-2 p-3 rounded-lg border border-divider bg-background"
                    >
                      <SmartIngredientInput
                        productId={ingredient.productId}
                        // @ts-ignore
                        value={
                          ingredient.productName
                            ? {
                                id: ingredient.productId || "",
                                name: ingredient.productName,
                                brand: null,
                                category: null
                              }
                            : undefined
                        }
                        onProductSelect={(product) =>
                          handleUpdateIngredientInGroup(groupIndex, ingIndex, "product", product)
                        }
                        placeholder={t`Search for a product...`}
                        isRequired
                      />
                      <div className="flex gap-2 w-full">
                        <Input
                          type="number"
                          value={ingredient.quantity.toString()}
                          onValueChange={(value) =>
                            handleUpdateIngredientInGroup(
                              groupIndex,
                              ingIndex,
                              "quantity",
                              Number.parseFloat(value) || 0.01
                            )
                          }
                          isRequired
                          min={0.01}
                          step={0.01}
                          placeholder="Qty"
                          variant="bordered"
                          className="w-1/3 sm:w-32"
                        />
                        <Select
                          selectedKeys={ingredient.unit ? [ingredient.unit] : []}
                          onSelectionChange={(keys) => {
                            const key = Array.from(keys)[0];
                            handleUpdateIngredientInGroup(groupIndex, ingIndex, "unit", key as string);
                          }}
                          placeholder={t`Unit`}
                          variant="bordered"
                          className="flex-1"
                          isRequired
                          aria-label={t`Select unit`}
                        >
                          {unitOptions.map((option) => (
                            <SelectItem key={option.value}>{option.label}</SelectItem>
                          ))}
                        </Select>
                        <Button
                          isIconOnly
                          color="danger"
                          variant="flat"
                          onPress={() => handleRemoveIngredientFromGroup(groupIndex, ingIndex)}
                          className="shrink-0"
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>

                <Button
                  variant="flat"
                  color="primary"
                  onPress={() => handleAddIngredientToGroup(groupIndex)}
                  startContent={<Plus className="w-4 h-4" />}
                  className="mt-3 w-full"
                  size="sm"
                >
                  <Trans>Add ingredient</Trans>
                </Button>
              </Card>
            ))}

            <Button
              variant="bordered"
              color="primary"
              onPress={handleAddGroup}
              startContent={<Plus className="w-4 h-4" />}
              className="w-full"
            >
              <Trans>Add Group</Trans>
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            {(ingredients || []).map((ingredient, index) => (
              <div key={ingredient.productId || `ingredient-${index}`} className="space-y-3">
                <div className="flex flex-col gap-2 p-3 rounded-lg border border-divider bg-default-50">
                  <SmartIngredientInput
                    productId={ingredient.productId}
                    // @ts-ignore
                    value={
                      ingredient.productName
                        ? {
                            id: ingredient.productId || "",
                            name: ingredient.productName,
                            brand: null,
                            category: null
                          }
                        : undefined
                    }
                    onProductSelect={(product) => handleProductSelect(index, product)}
                    placeholder={t`Search for a product...`}
                    isRequired
                  />
                  <div className="flex gap-2 w-full">
                    <Input
                      type="number"
                      value={ingredient.quantity.toString()}
                      onValueChange={(value) =>
                        onUpdateIngredient(index, "quantity", Number.parseFloat(value) || 0.01)
                      }
                      isRequired
                      min={0.01}
                      step={0.01}
                      placeholder="Qty"
                      variant="bordered"
                      className="w-1/3 sm:w-32"
                    />
                    <Select
                      selectedKeys={ingredient.unit ? [ingredient.unit] : []}
                      onSelectionChange={(keys) => {
                        const key = Array.from(keys)[0];
                        onUpdateIngredient(index, "unit", key as string);
                      }}
                      placeholder={t`Unit`}
                      variant="bordered"
                      className="flex-1"
                      isRequired
                      aria-label={t`Select unit`}
                    >
                      {unitOptions.map((option) => (
                        <SelectItem key={option.value}>{option.label}</SelectItem>
                      ))}
                    </Select>
                    <Button
                      isIconOnly
                      color="danger"
                      variant="flat"
                      onPress={() => onRemoveIngredient(index)}
                      className="shrink-0"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
                <Button
                  color="success"
                  variant="bordered"
                  startContent={<Plus className="w-4 h-4" />}
                  onPress={onAddIngredient}
                  size="sm"
                  className="w-full"
                >
                  <Trans>Add ingredient</Trans>
                </Button>
              </div>
            ))}
          </div>
        )}
      </CardBody>
    </Card>
  );
};
