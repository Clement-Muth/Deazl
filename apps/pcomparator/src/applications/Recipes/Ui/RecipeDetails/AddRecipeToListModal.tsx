"use client";

import {
  Avatar,
  Button,
  Checkbox,
  CheckboxGroup,
  Chip,
  Divider,
  Input,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  Select,
  SelectItem,
  addToast
} from "@heroui/react";
import { Trans, useLingui } from "@lingui/react/macro";
import { Check, Minus, Package, Plus, ShoppingCart, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { createShoppingList } from "~/packages/applications/shopping-lists/src/Api/shoppingLists/createShoppingList.api";
import { listUserShoppingList } from "~/packages/applications/shopping-lists/src/Api/shoppingLists/listUserShoppingList.api";
import { addRecipeToShoppingList } from "../../Api";
import type { RecipePayload } from "../../Domain/Schemas/Recipe.schema";

interface AddRecipeToListModalProps {
  recipe: RecipePayload;
  isOpen: boolean;
  onClose: () => void;
}

export const AddRecipeToListModal = ({ recipe, isOpen, onClose }: AddRecipeToListModalProps) => {
  const { t } = useLingui();
  const router = useRouter();
  const [lists, setLists] = useState<Array<{ id: string; name: string }>>([]);
  const [selectedListId, setSelectedListId] = useState<string>("");
  const [servingsMultiplier, setServingsMultiplier] = useState(1);
  const [selectedIngredients, setSelectedIngredients] = useState<string[]>([]);
  const [isCreatingList, setIsCreatingList] = useState(false);
  const [newListName, setNewListName] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [mergePreview, setMergePreview] = useState<{
    merged: number;
    added: number;
  } | null>(null);

  // Load user's shopping lists
  useEffect(() => {
    if (isOpen) {
      loadLists();
      // Select all ingredients by default
      setSelectedIngredients(recipe.ingredients?.map((ing) => ing.id) || []);
      setServingsMultiplier(1);
      setIsCreatingList(false);
      setNewListName("");
      setMergePreview(null);
    }
  }, [isOpen, recipe.ingredients]);

  const loadLists = async () => {
    try {
      const userLists = await listUserShoppingList();
      if (!userLists) return;
      setLists(userLists);
      if (userLists.length > 0 && !selectedListId) {
        setSelectedListId(userLists[0].id);
      }
    } catch (error) {
      console.error("Error loading lists:", error);
    }
  };

  const handleCreateList = async () => {
    if (!newListName.trim()) {
      addToast({
        title: <Trans>Error</Trans>,
        description: <Trans>Please enter a list name</Trans>,
        color: "danger"
      });
      return;
    }

    try {
      const newList = await createShoppingList({
        name: newListName.trim(),
        description: `Shopping list for ${recipe.name}`
      });

      setLists([...lists, { id: newList.id, name: newList.name }]);
      setSelectedListId(newList.id);
      setIsCreatingList(false);
      setNewListName("");

      addToast({
        title: <Trans>Success</Trans>,
        description: <Trans>Shopping list created</Trans>,
        color: "success"
      });
    } catch (error) {
      addToast({
        title: <Trans>Error</Trans>,
        description: <Trans>Failed to create shopping list</Trans>,
        color: "danger"
      });
    }
  };

  const handleSubmit = async () => {
    if (!selectedListId) {
      addToast({
        title: <Trans>Error</Trans>,
        description: <Trans>Please select a shopping list</Trans>,
        color: "danger"
      });
      return;
    }

    if (selectedIngredients.length === 0) {
      addToast({
        title: <Trans>Error</Trans>,
        description: <Trans>Please select at least one ingredient</Trans>,
        color: "danger"
      });
      return;
    }

    console.log(selectedListId, selectedIngredients.length);

    setIsSubmitting(true);

    try {
      const result = await addRecipeToShoppingList({
        recipeId: recipe.id,
        listId: selectedListId,
        servingsMultiplier,
        selectedIngredientIds: selectedIngredients
      });

      addToast({
        title: <Trans>Success!</Trans>,
        description: (
          <Trans>
            Added {result.stats.added} items, merged {result.stats.merged} duplicates
          </Trans>
        ),
        color: "success"
      });

      onClose();
      router.push(`/shopping-lists/${selectedListId}`);
    } catch (error) {
      console.error("Error adding recipe to list:", error);
      addToast({
        title: <Trans>Error</Trans>,
        description: error instanceof Error ? error.message : <Trans>Failed to add recipe to list</Trans>,
        color: "danger"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const adjustServings = (delta: number) => {
    const newValue = Math.max(0.5, servingsMultiplier + delta);
    setServingsMultiplier(Number(newValue.toFixed(1)));
  };

  const toggleIngredient = useCallback((ingredientId: string) => {
    setSelectedIngredients((prev) =>
      prev.includes(ingredientId) ? prev.filter((id) => id !== ingredientId) : [...prev, ingredientId]
    );
  }, []);

  const selectedCount = selectedIngredients.length;
  const totalCount = recipe.ingredients?.length || 0;

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="2xl" scrollBehavior="inside">
      <ModalContent>
        <ModalHeader className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <ShoppingCart className="w-5 h-5" />
            <Trans>Add to Shopping List</Trans>
          </div>
          <p className="text-sm font-normal text-gray-600 dark:text-gray-400">{recipe.name}</p>
        </ModalHeader>

        <ModalBody className="gap-4">
          {/* Shopping List Selector */}
          <div className="space-y-2">
            <div className="text-sm font-medium">
              <Trans>Select Shopping List</Trans>
            </div>

            {!isCreatingList ? (
              <div className="flex gap-2">
                <Select
                  selectedKeys={selectedListId ? [selectedListId] : []}
                  onSelectionChange={(keys) => {
                    const key = Array.from(keys)[0];
                    setSelectedListId(key as string);
                  }}
                  placeholder={t`Choose a list`}
                  className="flex-1"
                  variant="bordered"
                >
                  {lists.map((list) => (
                    <SelectItem key={list.id}>{list.name}</SelectItem>
                  ))}
                </Select>
                <Button variant="bordered" onPress={() => setIsCreatingList(true)}>
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
            ) : (
              <div className="flex gap-2">
                <Input
                  value={newListName}
                  onValueChange={setNewListName}
                  placeholder={t`New list name`}
                  variant="bordered"
                  autoFocus
                />
                <Button color="primary" onPress={handleCreateList}>
                  <Check className="w-4 h-4" />
                </Button>
                <Button variant="light" onPress={() => setIsCreatingList(false)}>
                  <X className="w-4 h-4" />
                </Button>
              </div>
            )}
          </div>

          <Divider />

          {/* Servings Adjuster */}
          <div className="space-y-2">
            <div className="text-sm font-medium">
              <Trans>Adjust Portions</Trans>
            </div>
            <div className="flex items-center gap-4">
              <Button isIconOnly size="sm" variant="flat" onPress={() => adjustServings(-0.5)}>
                <Minus className="w-4 h-4" />
              </Button>
              <div className="flex items-center gap-2">
                <span className="text-2xl font-bold">{servingsMultiplier}x</span>
                <span className="text-sm text-gray-600">
                  ({recipe.servings * servingsMultiplier} <Trans>servings</Trans>)
                </span>
              </div>
              <Button isIconOnly size="sm" variant="flat" onPress={() => adjustServings(0.5)}>
                <Plus className="w-4 h-4" />
              </Button>
            </div>
          </div>

          <Divider />

          {/* Ingredients Selection */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="text-sm font-medium">
                <Trans>Select Ingredients</Trans>
              </div>
              <Chip size="sm" variant="flat">
                {selectedCount}/{totalCount}
              </Chip>
            </div>

            <CheckboxGroup value={selectedIngredients} onValueChange={setSelectedIngredients}>
              <div className="space-y-2">
                {recipe.ingredients?.map((ingredient) => (
                  <Checkbox
                    key={ingredient.id}
                    value={ingredient.id}
                    classNames={{ base: "w-full max-w-full" }}
                  >
                    <div className="flex items-center gap-2 w-full">
                      <Avatar icon={<Package className="w-4 h-4" />} size="sm" className="flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{ingredient.productName || "Unknown"}</p>
                        <p className="text-xs text-gray-500">
                          {(ingredient.quantity * servingsMultiplier).toFixed(2)} {ingredient.unit}
                        </p>
                      </div>
                    </div>
                  </Checkbox>
                ))}
              </div>
            </CheckboxGroup>
          </div>

          {mergePreview && (
            <>
              <Divider />
              <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg">
                <p className="text-sm font-medium text-blue-900 dark:text-blue-100">
                  <Trans>Smart Merge Preview</Trans>
                </p>
                <p className="text-xs text-blue-700 dark:text-blue-300 mt-1">
                  <Trans>
                    {mergePreview.merged} items will be merged, {mergePreview.added} new items will be added
                  </Trans>
                </p>
              </div>
            </>
          )}
        </ModalBody>

        <ModalFooter>
          <Button variant="light" onPress={onClose}>
            <Trans>Cancel</Trans>
          </Button>
          <Button
            color="primary"
            onPress={handleSubmit}
            isLoading={isSubmitting}
            isDisabled={!selectedListId}
          >
            <ShoppingCart className="w-4 h-4" />
            <Trans>Add to List</Trans>
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};
