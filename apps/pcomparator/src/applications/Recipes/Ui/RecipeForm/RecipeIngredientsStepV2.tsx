"use client";

import {
  Button,
  Card,
  CardBody,
  CardHeader,
  Divider,
  Input,
  NumberInput,
  Select,
  SelectItem
} from "@heroui/react";
import { useLingui } from "@lingui/react/macro";
import { Trans } from "@lingui/react/macro";
import { Copy, Plus, Trash2 } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { UnitType } from "~/applications/ShoppingLists/Domain/ValueObjects/Unit.vo";
import type { ProductSearchResult } from "../../Api/products/searchProducts.api";
import type { CreateRecipePayload } from "../../Domain/Schemas/Recipe.schema";
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

  const [groups, setGroups] = useState<IngredientGroup[]>(() => {
    if (initialGroups && initialGroups.length > 0) {
      return initialGroups;
    }
    if (ingredients && ingredients.length > 0) {
      return [
        {
          name: "",
          order: 0,
          ingredients: ingredients.map((ing, idx) => ({
            productId: ing.productId || "",
            productName: ing.productName,
            quantity: ing.quantity || 1,
            unit: ing.unit || "unit",
            order: idx
          }))
        }
      ];
    }
    return [{ name: "", order: 0, ingredients: [] }];
  });

  const isGroupMode = groups.length > 1 || (groups.length === 1 && groups[0].name !== "");
  const prevGroupsRef = useRef<string>("");

  useEffect(() => {
    const groupsStr = JSON.stringify(groups);
    if (onGroupsChange && prevGroupsRef.current !== groupsStr) {
      prevGroupsRef.current = groupsStr;
      onGroupsChange(isGroupMode ? groups : []);
    }
  }, [groups, isGroupMode]);

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

  const syncToSimpleMode = () => {
    const allIngredients = groups.flatMap((group) => group.ingredients);

    setGroups([{ name: "", order: 0, ingredients: allIngredients }]);

    const currentCount = ingredients?.length || 0;
    for (let i = currentCount - 1; i >= 0; i--) {
      onRemoveIngredient(i);
    }

    for (const _ of allIngredients) {
      onAddIngredient();
    }

    setTimeout(() => {
      allIngredients.forEach((ing, idx) => {
        onUpdateIngredient(idx, "_batch", {
          productId: ing.productId,
          productName: ing.productName,
          quantity: ing.quantity,
          unit: ing.unit,
          order: idx
        });
      });
    }, 0);
  };

  const handleAddGroup = () => {
    const newGroups = [...groups, { name: "", order: groups.length, ingredients: [] }];
    setGroups(newGroups);
  };

  const handleDuplicateGroup = (groupIndex: number) => {
    const groupToDuplicate = groups[groupIndex];
    const newGroup: IngredientGroup = {
      ...groupToDuplicate,
      name: `${groupToDuplicate.name} (Copy)`,
      order: groups.length,
      ingredients: groupToDuplicate.ingredients.map((ing) => ({ ...ing }))
    };
    const newGroups = [...groups, newGroup];
    setGroups(newGroups);
  };

  const handleRemoveGroup = (groupIndex: number) => {
    if (groups.length === 1) return;
    const newGroups = groups.filter((_, idx) => idx !== groupIndex);
    setGroups(newGroups);
  };

  const handleUpdateGroupName = (groupIndex: number, name: string) => {
    const newGroups = [...groups];
    newGroups[groupIndex].name = name;
    setGroups(newGroups);
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
  };

  const handleDuplicateIngredient = (groupIndex: number, ingIndex: number) => {
    const newGroups = [...groups];
    const ingredientToDuplicate = newGroups[groupIndex].ingredients[ingIndex];
    newGroups[groupIndex].ingredients.splice(ingIndex + 1, 0, {
      ...ingredientToDuplicate,
      order: ingredientToDuplicate.order + 1
    });
    setGroups(newGroups);
  };

  const handleRemoveIngredientFromGroup = (groupIndex: number, ingIndex: number) => {
    const newGroups = [...groups];
    newGroups[groupIndex].ingredients = newGroups[groupIndex].ingredients.filter(
      (_, idx) => idx !== ingIndex
    );
    setGroups(newGroups);
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
  };

  const handleProductSelect = (index: number, product: ProductSearchResult) => {
    onUpdateIngredient(index, "_batch", {
      ...ingredients?.[index],
      productId: product.id,
      productName: product.name
    });
  };

  if (isGroupMode) {
    return (
      <Card>
        <CardHeader className="border-b border-divider bg-gray-50 dark:bg-gray-900 p-4 sm:p-6">
          <div className="flex items-center justify-between w-full">
            <h2 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-gray-100">
              <Trans>Ingredients</Trans>
            </h2>
            <Button
              color="primary"
              size="sm"
              onPress={handleAddGroup}
              startContent={<Plus className="w-4 h-4" />}
            >
              <Trans>Add Group</Trans>
            </Button>
          </div>
        </CardHeader>
        <CardBody className="p-4 sm:p-6">
          <div className="mb-4 p-3 bg-blue-50 dark:bg-blue-950 rounded-lg border border-blue-200 dark:border-blue-800">
            <p className="text-sm text-blue-900 dark:text-blue-100">
              <Trans>
                Group your ingredients by category (e.g., Dough, Filling, Sauce). This helps organize complex
                recipes.
              </Trans>
            </p>
          </div>

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
                  />
                  <Button
                    isIconOnly
                    color="secondary"
                    variant="light"
                    onPress={() => handleDuplicateGroup(groupIndex)}
                    size="lg"
                    aria-label={t`Duplicate group`}
                  >
                    <Copy className="w-5 h-5" />
                  </Button>
                  {groups.length > 1 && (
                    <Button
                      isIconOnly
                      color="danger"
                      variant="light"
                      onPress={() => handleRemoveGroup(groupIndex)}
                      size="lg"
                      aria-label={t`Remove group`}
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
                        value={
                          ingredient.productName
                            ? {
                                id: ingredient.productId || "",
                                name: ingredient.productName,
                                brand: undefined,
                                category: undefined,
                                barcode: ""
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
                        {/* <NumberInput
                          type="number"
                          value={ingredient.quantity}
                          onValueChange={(value) => {
                            // const num = value === "" ? 0 : Number.parseFloat(value);
                            if (!Number.isNaN(value) && value >= 0) {
                              handleUpdateIngredientInGroup(groupIndex, ingIndex, "quantity", value || 0);
                            }
                          }}
                          isRequired
                          // min={0}
                          // step={0.01}
                          placeholder="0"
                          className="w-24"
                        /> */}
                        <Select
                          defaultSelectedKeys={ingredient.unit ? [ingredient.unit] : []}
                          onSelectionChange={(keys) => {
                            const value = Array.from(keys)[0] as string;
                            handleUpdateIngredientInGroup(groupIndex, ingIndex, "unit", value);
                          }}
                          className="flex-1"
                          aria-label={t`Unit`}
                          disallowEmptySelection
                        >
                          {unitOptions.map((option) => (
                            <SelectItem key={option.value}>{option.label}</SelectItem>
                          ))}
                        </Select>
                        <Button
                          isIconOnly
                          color="secondary"
                          variant="light"
                          onPress={() => handleDuplicateIngredient(groupIndex, ingIndex)}
                          size="lg"
                          aria-label={t`Duplicate ingredient`}
                        >
                          <Copy className="w-4 h-4" />
                        </Button>
                        <Button
                          isIconOnly
                          color="danger"
                          variant="light"
                          onPress={() => handleRemoveIngredientFromGroup(groupIndex, ingIndex)}
                          size="lg"
                          aria-label={t`Remove ingredient`}
                        >
                          <Trash2 className="w-5 h-5" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>

                <Button
                  color="secondary"
                  variant="flat"
                  onPress={() => handleAddIngredientToGroup(groupIndex)}
                  startContent={<Plus className="w-4 h-4" />}
                  className="w-full mt-3"
                >
                  <Trans>Add Ingredient</Trans>
                </Button>
              </Card>
            ))}
          </div>

          <Button color="default" variant="light" onPress={syncToSimpleMode} size="sm" className="mt-4">
            <Trans>Switch to Simple List</Trans>
          </Button>
        </CardBody>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="border-b border-divider bg-gray-50 dark:bg-gray-900 p-4 sm:p-6">
        <h2 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-gray-100">
          <Trans>Ingredients</Trans>
        </h2>
      </CardHeader>
      <CardBody className="p-4 sm:p-6">
        <div className="mb-4 p-3 bg-default-100 rounded-lg">
          <p className="text-sm text-default-600">
            <Trans>
              Add your ingredients one by one. For complex recipes, you can organize them into groups.
            </Trans>
          </p>
        </div>

        <div className="space-y-3">
          {ingredients?.map((ingredient, index) => (
            <div
              key={index}
              className="flex flex-col gap-2 p-3 rounded-lg border border-divider bg-background"
            >
              <SmartIngredientInput
                productId={ingredient.productId}
                value={
                  ingredient.productName
                    ? {
                        id: ingredient.productId || "",
                        name: ingredient.productName,
                        brand: undefined,
                        category: undefined,
                        barcode: ""
                      }
                    : undefined
                }
                onProductSelect={(product) => handleProductSelect(index, product)}
                placeholder={t`Search for a product...`}
                isRequired
              />
              <div className="flex gap-2 w-full">
                <NumberInput
                  value={ingredient.quantity}
                  onValueChange={(value) => {
                    // const num = value === "" ? 0 : Number.parseFloat(value);
                    if (!Number.isNaN(value) && value >= 0) {
                      onUpdateIngredient(index, "quantity", value || 0);
                    }
                  }}
                  isRequired
                  min={0}
                  step={0.01}
                  placeholder="0"
                  size="sm"
                  className="w-24"
                />
                <Select
                  defaultSelectedKeys={ingredient.unit ? [ingredient.unit] : ["unit"]}
                  onSelectionChange={(keys) => {
                    const value = Array.from(keys)[0] as string;
                    onUpdateIngredient(index, "unit", value);
                  }}
                  size="lg"
                  className="flex-1"
                  aria-label={t`Unit`}
                  disallowEmptySelection
                >
                  {unitOptions.map((option) => (
                    <SelectItem key={option.value}>{option.label}</SelectItem>
                  ))}
                </Select>
                <Button
                  isIconOnly
                  color="danger"
                  variant="light"
                  onPress={() => onRemoveIngredient(index)}
                  size="lg"
                >
                  <Trash2 className="w-5 h-5" />
                </Button>
              </div>
            </div>
          ))}
        </div>

        <div className="flex gap-2 mt-4">
          <Button
            color="primary"
            variant="flat"
            onPress={onAddIngredient}
            startContent={<Plus className="w-4 h-4" />}
            className="flex-1"
          >
            <Trans>Add Ingredient</Trans>
          </Button>
          {ingredients && ingredients.length > 0 && (
            <Button
              color="secondary"
              variant="light"
              onPress={() => {
                const newGroups: IngredientGroup[] = [
                  {
                    name: "",
                    order: 0,
                    ingredients: ingredients.map((ing, idx) => ({
                      productId: ing.productId || "",
                      productName: ing.productName,
                      quantity: ing.quantity || 1,
                      unit: ing.unit || "unit",
                      order: idx
                    }))
                  },
                  { name: "", order: 1, ingredients: [] }
                ];
                setGroups(newGroups);
              }}
              size="sm"
            >
              <Trans>Organize in Groups</Trans>
            </Button>
          )}
        </div>
      </CardBody>
    </Card>
  );
};
