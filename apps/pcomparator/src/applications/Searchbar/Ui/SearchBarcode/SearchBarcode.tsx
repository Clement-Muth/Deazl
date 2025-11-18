import { BarcodeScannerWithUI } from "@deazl/components";
import { Button, useDisclosure } from "@heroui/react";
import { ScanBarcode } from "lucide-react";
import { useState } from "react";
import { SearchResultModal } from "~/applications/Searchbar/Ui/SearchResult/SearchResultModal";

interface SearchBarcodeProps {
  onNewProduct: (barcode: string, resultBarcode: object) => void;
  onNoPrices: (barcode: string) => void;
}

export const SearchBarcode = ({ onNewProduct, onNoPrices }: SearchBarcodeProps) => {
  const { isOpen, onClose, onOpen } = useDisclosure();
  const [step, setStep] = useState(1);
  const [search, setSearch] = useState<string | null>(null);

  const handleBarcodeScanned = (barcode: string) => {
    setSearch(barcode);
    setStep(2);
    onClose();
  };

  return (
    <>
      {step === 1 && isOpen && (
        <BarcodeScannerWithUI
          onClose={onClose}
          onScanned={handleBarcodeScanned}
          title="Scan Product"
          description="Scan a barcode to search for products and prices"
        />
      )}
      {step === 2 && search && (
        <SearchResultModal search={search} onNewProduct={onNewProduct} onNoPrices={onNoPrices} />
      )}
      <Button
        startContent={<ScanBarcode />}
        onPress={onOpen}
        radius="full"
        variant="faded"
        className="p-7 w-18 h-18 -mt-8 border-none shadow-[0_5px_10px_1px_rgba(0,0,0,.2)]"
        isIconOnly
      />
    </>
  );
};
