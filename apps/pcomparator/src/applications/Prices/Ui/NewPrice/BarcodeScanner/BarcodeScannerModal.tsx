import { BarcodeScanner } from "react-barcode-scanner";
import type { Barcode } from "~/applications/Prices/Domain/ValueObjects/Barcode";
import { Modal } from "~/components/Modal/Modal";

interface BarcodeScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenChange: (isOpen: boolean) => void;
  onBarcodeDetected: (barcode: Barcode) => void;
}

export const BarcodeScannerModal = ({
  isOpen,
  onClose,
  onOpenChange,
  onBarcodeDetected
}: BarcodeScannerModalProps) => {
  return (
    <Modal
      isOpen={isOpen}
      onOpenChange={onOpenChange}
      body={
        <BarcodeScanner
          onCapture={(barcode) => onBarcodeDetected({ barcode: barcode.rawValue, format: barcode.format })}
          className="pointer-events-none !h-[80dvh]"
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
      onClose={onClose}
      modalProps={{ size: "4xl", classNames: { body: "!p-0", footer: "p-0", header: "p-0" } }}
      data-testid="modal-barcode-scanner"
      fullwidth
    />
  );
};
