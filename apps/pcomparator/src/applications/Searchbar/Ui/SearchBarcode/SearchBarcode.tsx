import { Button, useDisclosure } from "@heroui/react";
import { ScanBarcode } from "lucide-react";
import { useState } from "react";
import { BarcodeScannerModal } from "~/applications/Searchbar/Ui/SearchBarcode/BarcodeScannerModal";
import { SearchResultModal } from "~/applications/Searchbar/Ui/SearchResult/SearchResultModal";

interface SearchBarcodeProps {
  onNewProduct: (barcode: string, resultBarcode: object) => void;
  onNoPrices: (barcode: string) => void;
}

export const SearchBarcode = ({ onNewProduct, onNoPrices }: SearchBarcodeProps) => {
  const { isOpen, onClose, onOpen } = useDisclosure();
  const [step, setStep] = useState(1);
  const [search, setSearch] = useState<string | null>(null);

  return (
    <>
      {step === 1 ? (
        <BarcodeScannerModal
          isOpen={isOpen}
          onClose={onClose}
          onBarcodeDetected={(barcode) => {
            setSearch(barcode.barcode);
            setStep(2);
            onClose();
          }}
        />
      ) : search ? (
        <SearchResultModal search={search} onNewProduct={onNewProduct} onNoPrices={onNoPrices} />
      ) : null}
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
