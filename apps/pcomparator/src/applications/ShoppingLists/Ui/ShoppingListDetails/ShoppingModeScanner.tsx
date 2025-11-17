"use client";

import { BarcodeScannerWithUI } from "@deazl/components";
import { Button, Card, CardBody, CardHeader } from "@heroui/react";
import { ShoppingCartIcon, XIcon } from "lucide-react";
import { useCallback, useState } from "react";
import type { ShoppingListItemPayload } from "../../Domain/Entities/ShoppingListItem.entity";

interface ShoppingModeScannerProps {
  items: ShoppingListItemPayload[];
  onItemToggleAction: (itemId: string, isCompleted: boolean) => Promise<void>;
  onItemAddAction: (item: any) => void;
  onCloseAction: () => void;
}

export const ShoppingModeScanner = ({
  items,
  onItemToggleAction,
  onItemAddAction,
  onCloseAction
}: ShoppingModeScannerProps) => {
  const [isScanning, setIsScanning] = useState(true);
  const [lastScannedItem, setLastScannedItem] = useState<string | null>(null);
  const [scanCount, setScanCount] = useState(0);

  const handleBarcodeScanned = useCallback(
    async (barcode: string) => {
      try {
        // 1. Chercher si un item existant a ce code-barres
        const existingItem = items.find((item) => item.product?.barcode === barcode);

        if (existingItem) {
          // Item trouvé dans la liste → le marquer comme complété
          if (!existingItem.isCompleted) {
            await onItemToggleAction(existingItem.id, true);
            setLastScannedItem(existingItem.product?.name || "Item");
            setScanCount((prev) => prev + 1);
          } else {
            setLastScannedItem(`${existingItem.product?.name} (déjà complété)`);
          }
        } else {
          // 2. Item non trouvé → rechercher dans OpenFoodFacts et ajouter
          try {
            // const result = await searchByBarcode({ barcode });
            const result: any = {};

            if (result.success) {
              // Ajouter l'item avec les données OpenFoodFacts
              onItemAddAction({
                customName: result.name,
                quantity: 1,
                unit: "unit",
                isCompleted: true, // Marqué comme complété car on vient de le scanner
                barcode: barcode
              });

              setLastScannedItem(`${result.name} (ajouté)`);
              setScanCount((prev) => prev + 1);
            } else {
              // Ajouter un item générique
              onItemAddAction({
                customName: `Produit ${barcode}`,
                quantity: 1,
                unit: "unit",
                isCompleted: true,
                barcode: barcode
              });

              setLastScannedItem(`Produit ${barcode} (ajouté)`);
              setScanCount((prev) => prev + 1);
            }
          } catch (error) {
            console.error("Erreur lors de la recherche OpenFoodFacts:", error);
          }
        }

        // Auto-reprendre le scan après 1.5 secondes
        setTimeout(() => {
          setIsScanning(true);
        }, 1500);
      } catch (error) {
        console.error("Erreur lors du scan:", error);
        setIsScanning(true);
      }
    },
    [items, onItemToggleAction, onItemAddAction]
  );

  const handleScannerClose = useCallback(() => {
    setIsScanning(false);
    // Redémarrer le scan après 500ms
    setTimeout(() => {
      setIsScanning(true);
    }, 500);
  }, []);

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t shadow-lg">
      <Card className="rounded-none border-x-0 border-b-0">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between w-full">
            <div className="flex items-center gap-2">
              <ShoppingCartIcon className="h-5 w-5 text-primary-500" />
              <div>
                <h3 className="font-semibold text-sm">Mode Shopping</h3>
                <p className="text-xs text-gray-500">
                  {scanCount} produit{scanCount > 1 ? "s" : ""} scanné{scanCount > 1 ? "s" : ""}
                </p>
              </div>
            </div>

            <Button
              isIconOnly
              size="sm"
              variant="light"
              onPress={onCloseAction}
              aria-label="Fermer le mode shopping"
            >
              <XIcon className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>

        <CardBody className="pt-0 pb-4">
          {lastScannedItem && (
            <div className="mb-3 p-2 bg-green-50 border border-green-200 rounded-lg">
              <p className="text-sm text-green-700 font-medium">Dernier scan: {lastScannedItem}</p>
            </div>
          )}

          <div className="text-center">
            <p className="text-sm text-gray-600 mb-2">Scannez les codes-barres de vos produits</p>

            {/* Stats de la liste */}
            <div className="flex justify-center gap-4 text-xs text-gray-500">
              <span>Total: {items.length}</span>
              <span>Complétés: {items.filter((i) => i.isCompleted).length}</span>
              <span>Restants: {items.filter((i) => !i.isCompleted).length}</span>
            </div>
          </div>
        </CardBody>
      </Card>

      {/* Scanner persistant */}
      {isScanning && (
        <BarcodeScannerWithUI
          onClose={handleScannerClose}
          onScanned={handleBarcodeScanned}
          continuous
          title="Mode Shopping"
          description="Scannez un produit pour le marquer comme complété"
        />
      )}
    </div>
  );
};
