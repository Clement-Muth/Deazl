"use client";

import { useCallback, useEffect, useState } from "react";
import type { ConversionResult } from "../../Application/Services/SmartConversion.service";

export interface ConversionOpportunity {
  itemId: string;
  itemName: string;
  listId: string;
}

interface UseSmartConversionNotificationsProps {
  listId: string;
  onItemCompleted?: (itemId: string, itemName: string) => void;
}

export const useSmartConversionNotifications = ({
  listId,
  onItemCompleted
}: UseSmartConversionNotificationsProps) => {
  const [opportunities, setOpportunities] = useState<ConversionOpportunity[]>([]);
  const [activeNotification, setActiveNotification] = useState<ConversionOpportunity | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Identifier les opportunités de conversion
  const identifyOpportunities = useCallback(async () => {
    if (!listId) return;

    setIsLoading(true);
    try {
      const response = await fetch(`/api/shopping-lists/${listId}/conversion-opportunities`);
      if (response.ok) {
        const itemIds: string[] = await response.json();

        // Récupérer les détails des items pour les opportunités
        const opportunityPromises = itemIds.map(async (itemId) => {
          try {
            const itemResponse = await fetch(`/api/shopping-lists/items/${itemId}`);
            if (itemResponse.ok) {
              const item = await itemResponse.json();
              return {
                itemId: item.id,
                itemName: item.product?.name || "Unnamed item",
                listId
              };
            }
          } catch (error) {
            console.error("Error fetching item details:", error);
          }
          return null;
        });

        const resolvedOpportunities = await Promise.all(opportunityPromises);
        const validOpportunities = resolvedOpportunities.filter(Boolean) as ConversionOpportunity[];

        setOpportunities(validOpportunities);

        // Afficher la première opportunité si disponible
        if (validOpportunities.length > 0 && !activeNotification) {
          setActiveNotification(validOpportunities[0]);
        }
      }
    } catch (error) {
      console.error("Error identifying conversion opportunities:", error);
    } finally {
      setIsLoading(false);
    }
  }, [listId, activeNotification]);

  // Gérer la completion d'un item
  const handleItemCompleted = useCallback(
    (itemId: string, itemName: string) => {
      // Ajouter l'item aux opportunités s'il n'est pas déjà présent
      setOpportunities((prev) => {
        const exists = prev.some((opp) => opp.itemId === itemId);
        if (!exists) {
          const newOpportunity = { itemId, itemName, listId };

          // Si aucune notification active, afficher celle-ci
          if (!activeNotification) {
            setActiveNotification(newOpportunity);
          }

          return [...prev, newOpportunity];
        }
        return prev;
      });

      onItemCompleted?.(itemId, itemName);
    },
    [listId, activeNotification, onItemCompleted]
  );

  // Marquer une opportunité comme traitée
  const markOpportunityHandled = useCallback(
    (itemId: string) => {
      setOpportunities((prev) => prev.filter((opp) => opp.itemId !== itemId));

      if (activeNotification?.itemId === itemId) {
        // Passer à la prochaine opportunité
        const remainingOpportunities = opportunities.filter((opp) => opp.itemId !== itemId);
        setActiveNotification(remainingOpportunities.length > 0 ? remainingOpportunities[0] : null);
      }
    },
    [activeNotification, opportunities]
  );

  // Gérer la conversion réussie
  const handleConversionComplete = useCallback(
    (result: ConversionResult) => {
      if (result.success) {
        markOpportunityHandled(result.itemId);
      }
    },
    [markOpportunityHandled]
  );

  // Rejeter une notification
  const dismissNotification = useCallback(() => {
    if (activeNotification) {
      markOpportunityHandled(activeNotification.itemId);
    }
  }, [activeNotification, markOpportunityHandled]);

  // Passer à la notification suivante
  const nextNotification = useCallback(() => {
    if (activeNotification) {
      const currentIndex = opportunities.findIndex((opp) => opp.itemId === activeNotification.itemId);
      const nextIndex = (currentIndex + 1) % opportunities.length;
      setActiveNotification(opportunities[nextIndex] || null);
    }
  }, [activeNotification, opportunities]);

  // Charger les opportunités au montage
  useEffect(() => {
    identifyOpportunities();
  }, [identifyOpportunities]);

  return {
    opportunities,
    activeNotification,
    isLoading,
    handleItemCompleted,
    handleConversionComplete,
    dismissNotification,
    nextNotification,
    markOpportunityHandled,
    hasOpportunities: opportunities.length > 0
  };
};
