"use client";

import { Input, useForm } from "@deazl/components";
import { Card, CardBody, CardFooter, Textarea } from "@heroui/react";
import { Trans } from "@lingui/react/macro";
import { type KeyboardEvent, useState } from "react";

type ItemType = {
  id: string;
  customName: string;
  quantity: number;
  unit: string;
};

export const ShoppingListCreateForm = ({
  action
}: {
  action: (formData: FormData) => Promise<{ error?: string }>;
}) => {
  const form = useForm<{ name: string }>(undefined);
  const [items, setItems] = useState<ItemType[]>([]);
  const [itemName, setItemName] = useState("");
  const [quantity, setQuantity] = useState("1");
  const [unit, setUnit] = useState("unit");
  const [isAddingItem, setIsAddingItem] = useState(false);

  const handleAddItem = () => {
    if (!itemName.trim()) return;

    setItems([
      ...items,
      {
        id: crypto.randomUUID(),
        customName: itemName,
        quantity: Number.parseFloat(quantity),
        unit
      }
    ]);

    // Reset inputs
    setItemName("");
    setQuantity("1");
    setUnit("unit");

    // Focus back on the item name input
    const nameInput = document.getElementById("itemName");
    if (nameInput) nameInput.focus();
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleAddItem();
    }
  };

  const removeItem = (id: string) => {
    setItems(items.filter((item) => item.id !== id));
  };

  const toggleAddItem = () => {
    setIsAddingItem(!isAddingItem);
    if (!isAddingItem) {
      // Focus on the item name input when we show the item form
      setTimeout(() => {
        const nameInput = document.getElementById("itemName");
        if (nameInput) nameInput.focus();
      }, 100);
    }
  };

  return (
    <Card>
      <form.Form
        methods={form.methods}
        onSubmit={(data) => {
          const formData = new FormData();
          formData.append("name", data.name);
          // @ts-ignore
          formData.append("description", data.description || "");

          // Add items to form data
          formData.append("items", JSON.stringify(items));

          action(formData);
        }}
        actions={{
          nextProps: {
            title: <Trans>Create Shopping List</Trans>,
            fullWidth: true,
            color: "primary"
          },
          wrapper: CardFooter,
          wrapperProps: { className: "justify-end border-t border-t-default -px-4" }
        }}
      >
        <CardBody className="pt-6 space-y-6">
          <div className="space-y-2">
            <label htmlFor="name">List Name</label>
            <Input id="name" name="name" placeholder="e.g., Weekly Groceries" isRequired />
          </div>

          <div className="space-y-2">
            <label htmlFor="description">Description (optional)</label>
            <Textarea
              id="description"
              name="description"
              placeholder="Add details about this shopping list"
              rows={3}
            />
          </div>
        </CardBody>
      </form.Form>
    </Card>
  );
};
