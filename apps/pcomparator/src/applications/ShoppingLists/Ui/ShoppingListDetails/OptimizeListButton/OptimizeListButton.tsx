"use client";

import { Button, addToast } from "@heroui/react";
import { Trans } from "@lingui/react/macro";
import { Sparkles } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { optimizeShoppingList } from "~/applications/ShoppingLists/Api/shoppingLists/optimizeShoppingList.api";

interface OptimizeListButtonProps {
  listId: string;
  onOptimizationComplete?: () => void;
}

export const OptimizeListButton = ({ listId, onOptimizationComplete }: OptimizeListButtonProps) => {
  const router = useRouter();
  const [isOptimizing, setIsOptimizing] = useState(false);

  const handleOptimize = async () => {
    setIsOptimizing(true);

    try {
      const result = await optimizeShoppingList(listId);

      if (result.success) {
        // Recharger les données depuis le serveur
        router.refresh();
        addToast({
          title: <Trans>Optimization successful</Trans>,
          description: `${result.optimizedItems} items optimized!`,
          variant: "solid",
          color: "success"
        });
        onOptimizationComplete?.();
      } else {
        addToast({
          title: <Trans>Error</Trans>,
          description: result.error || "Error optimizing",
          variant: "solid",
          color: "danger"
        });
      }
    } catch (error) {
      console.error("Error optimizing list:", error);
      addToast({
        title: <Trans>Error</Trans>,
        description: "An error occurred",
        variant: "solid",
        color: "danger"
      });
    } finally {
      setIsOptimizing(false);
    }
  };

  return (
    <Button
      color="primary"
      variant="flat"
      startContent={<Sparkles size={18} />}
      onPress={handleOptimize}
      isLoading={isOptimizing}
      className="w-full sm:w-auto"
    >
      {isOptimizing ? <Trans>Optimizing...</Trans> : <Trans>Optimize List</Trans>}
    </Button>
  );
};
