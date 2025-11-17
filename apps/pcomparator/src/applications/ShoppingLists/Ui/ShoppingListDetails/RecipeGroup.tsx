"use client";

import { Accordion, AccordionItem, Avatar, Badge, Button, Chip } from "@heroui/react";
import { Trans } from "@lingui/react/macro";
import { ChefHat, Trash2 } from "lucide-react";
import type { ShoppingListItemPayload } from "../../Domain/Entities/ShoppingListItem.entity";
import type { RecipeGroup as RecipeGroupType } from "../../Domain/Utils/groupByRecipe";

interface RecipeGroupProps {
  group: RecipeGroupType;
  onToggleItem: (itemId: string, isCompleted: boolean) => Promise<void>;
  onDeleteItem: (itemId: string) => Promise<void>;
  onUpdateItem: (itemId: string, data: Partial<ShoppingListItemPayload>) => Promise<void>;
  onRemoveAllRecipeItems?: (recipeId: string) => Promise<void>;
  renderItem: (item: ShoppingListItemPayload) => React.ReactNode;
}

export const RecipeGroup = ({
  group,
  onToggleItem,
  onDeleteItem,
  onUpdateItem,
  onRemoveAllRecipeItems,
  renderItem
}: RecipeGroupProps) => {
  const handleRemoveAll = async () => {
    if (!group.recipeId || !onRemoveAllRecipeItems) return;

    if (confirm(`Remove all ${group.stats.totalItems} items from "${group.recipeName}"?`)) {
      await onRemoveAllRecipeItems(group.recipeId);
    }
  };

  const isUngrouped = group.recipeId === null;
  const completionPercentage =
    group.stats.totalItems > 0 ? Math.round((group.stats.completedItems / group.stats.totalItems) * 100) : 0;

  return (
    <Accordion variant="bordered" className="px-0">
      <AccordionItem
        key={group.recipeId ?? "ungrouped"}
        aria-label={group.recipeName ?? "Ungrouped items"}
        startContent={
          isUngrouped ? (
            <Avatar
              icon={<ChefHat className="h-4 w-4" />}
              classNames={{
                base: "bg-default-100",
                icon: "text-default-500"
              }}
              size="sm"
            />
          ) : (
            <Avatar
              icon={<ChefHat className="h-4 w-4" />}
              classNames={{
                base: "bg-primary-100",
                icon: "text-primary-600"
              }}
              size="sm"
            />
          )
        }
        title={
          <div className="flex items-center gap-2">
            <span className="font-semibold text-base">
              {isUngrouped ? <Trans>Other items</Trans> : group.recipeName}
            </span>
            <Badge color={completionPercentage === 100 ? "success" : "default"} size="sm">
              {`${group.stats.completedItems}/${group.stats.totalItems}`}
            </Badge>
          </div>
        }
        subtitle={
          <div className="flex items-center gap-2 mt-1">
            {group.stats.totalPrice > 0 && (
              <Chip size="sm" variant="flat" color="primary">
                {group.stats.totalPrice.toFixed(2)}€
              </Chip>
            )}
            {completionPercentage > 0 && (
              <Chip size="sm" variant="flat" color={completionPercentage === 100 ? "success" : "warning"}>
                {completionPercentage}% <Trans>done</Trans>
              </Chip>
            )}
          </div>
        }
        classNames={{
          base: "mb-2",
          trigger: "py-3",
          title: "text-base font-semibold",
          content: "pt-0 pb-3"
        }}
      >
        <div className="space-y-2">
          {/* Remove all button for recipe groups */}
          {!isUngrouped && onRemoveAllRecipeItems && (
            <div className="flex justify-end pb-2 border-b border-divider">
              <Button
                size="sm"
                color="danger"
                variant="flat"
                startContent={<Trash2 className="h-4 w-4" />}
                onPress={handleRemoveAll}
              >
                <Trans>Remove all from recipe</Trans>
              </Button>
            </div>
          )}

          {/* Render items using the provided renderItem function */}
          <div className="space-y-2">
            {group.items.map((item) => (
              <div key={item.id}>{renderItem(item)}</div>
            ))}
          </div>
        </div>
      </AccordionItem>
    </Accordion>
  );
};
