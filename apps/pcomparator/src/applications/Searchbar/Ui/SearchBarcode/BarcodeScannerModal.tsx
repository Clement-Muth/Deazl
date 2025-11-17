import { useState } from "react";
import { BarcodeScanner } from "react-barcode-scanner";
import type { Barcode } from "~/applications/Prices/Domain/ValueObjects/Barcode";
import { Modal } from "~/components/Modal/Modal";

interface BarcodeScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onBarcodeDetected: (barcode: Barcode) => void;
}

export const BarcodeScannerModal = ({ isOpen, onClose, onBarcodeDetected }: BarcodeScannerModalProps) => {
  const [hasBeenCaptured, setHasBeenCaptured] = useState(false);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      data-testid="modal-barcode-scanner"
      body={
        <BarcodeScanner
          onCapture={(barcode) => {
            if (!hasBeenCaptured) {
              onBarcodeDetected({ barcode: barcode.rawValue, format: barcode.format });
              setHasBeenCaptured(true);
            }
          }}
          className="!h-[80dvh]"
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
      }
      fullwidth
    />
  );
};
