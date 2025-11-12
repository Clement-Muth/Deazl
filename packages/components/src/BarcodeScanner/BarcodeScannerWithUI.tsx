import { Button, Modal, ModalBody, ModalContent, ModalFooter, ModalHeader } from "@heroui/react";
import { X, Zap } from "lucide-react";
import { useState } from "react";
import { BarcodeScanner as ReactBarcodeScanner } from "react-barcode-scanner";
import "react-barcode-scanner/polyfill";

interface BarcodeScannerWithUIProps {
  onScanned: (barcode: string) => void;
  onClose: () => void;
  title?: string;
  description?: string;
  continuous?: boolean;
}

export const BarcodeScannerWithUI = ({
  onScanned,
  onClose,
  title = "Scanner un code-barres",
  description = "Positionnez le code-barres dans le cadre",
  continuous = false
}: BarcodeScannerWithUIProps) => {
  const [isScanning, setIsScanning] = useState(false);
  const [lastScanned, setLastScanned] = useState<string | null>(null);

  const handleCapture = (barcodes: Array<{ rawValue: string; format: string }>) => {
    if (!barcodes || barcodes.length === 0) return;

    const barcode = barcodes[0];
    console.log("🎉 Code-barres détecté:", barcode.rawValue);

    // Éviter de rescanner le même code immédiatement
    if (lastScanned === barcode.rawValue && !continuous) {
      return;
    }

    setLastScanned(barcode.rawValue);
    setIsScanning(true);
    onScanned(barcode.rawValue);

    if (!continuous) {
      // Fermer après un court délai pour l'UX
      setTimeout(() => {
        onClose();
      }, 500);
    } else {
      // En mode continu, attendre avant de permettre un nouveau scan
      setTimeout(() => {
        setLastScanned(null);
        setIsScanning(false);
      }, 2000);
    }
  };

  const handleManualInput = () => {
    const barcode = prompt("Entrez le code-barres manuellement:");
    if (barcode?.trim()) {
      onScanned(barcode.trim());
      if (!continuous) {
        onClose();
      }
    }
  };

  const simulateScanning = () => {
    const testBarcode = "3017620422003"; // Code-barres Nutella
    onScanned(testBarcode);
    if (!continuous) {
      onClose();
    }
  };

  return (
    <Modal
      isOpen={true}
      onClose={onClose}
      size="full"
      classNames={{
        base: "m-0 max-h-screen",
        wrapper: "w-full h-full",
        backdrop: "bg-black/80"
      }}
    >
      <ModalContent className="h-full flex flex-col">
        <ModalHeader className="flex justify-between items-center bg-black text-white">
          <div>
            <h2 className="text-lg font-semibold">{title}</h2>
            <p className="text-sm text-gray-300">{description}</p>
          </div>
          <Button isIconOnly variant="light" onPress={onClose} className="text-white">
            <X className="h-6 w-6" />
          </Button>
        </ModalHeader>

        <ModalBody className="flex-1 p-0 bg-black relative">
          {/* Scanner de react-barcode-scanner */}
          <div className="absolute inset-0">
            <ReactBarcodeScanner
              onCapture={handleCapture}
              options={{
                formats: [
                  "codabar",
                  "upc_a",
                  "code_128",
                  "code_39",
                  "code_93",
                  "data_matrix",
                  "ean_13",
                  "ean_8",
                  "itf",
                  "pdf417",
                  "qr_code",
                  "upc_e"
                ]
              }}
            />
          </div>

          {/* Overlay UI personnalisée */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="relative">
              {/* Cadre de scan */}
              <div className="w-64 h-32 border-2 border-white rounded-lg relative">
                {/* Coins du cadre */}
                <div className="absolute top-0 left-0 w-6 h-6 border-t-4 border-l-4 border-primary-500 rounded-tl-lg" />
                <div className="absolute top-0 right-0 w-6 h-6 border-t-4 border-r-4 border-primary-500 rounded-tr-lg" />
                <div className="absolute bottom-0 left-0 w-6 h-6 border-b-4 border-l-4 border-primary-500 rounded-bl-lg" />
                <div className="absolute bottom-0 right-0 w-6 h-6 border-b-4 border-r-4 border-primary-500 rounded-br-lg" />

                {/* Ligne de scan animée */}
                <div className="absolute inset-x-0 top-1/2 h-0.5 bg-primary-500 opacity-75 animate-pulse" />
              </div>

              {/* Message de statut */}
              <p className="text-white text-center mt-4 text-sm bg-black/50 px-3 py-1 rounded">
                {isScanning ? "✅ Code scanné !" : "Alignez le code-barres dans le cadre"}
              </p>
            </div>
          </div>
        </ModalBody>

        <ModalFooter className="bg-black">
          <div className="flex justify-center gap-4 w-full">
            <Button
              variant="bordered"
              onPress={handleManualInput}
              className="text-white border-white pointer-events-auto"
            >
              Saisie manuelle
            </Button>

            {process.env.NODE_ENV === "development" && (
              <Button
                color="warning"
                onPress={simulateScanning}
                startContent={<Zap className="h-4 w-4" />}
                className="pointer-events-auto"
              >
                Test Scanner
              </Button>
            )}
          </div>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};
