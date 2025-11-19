"use client";

import { BarcodeScannerWithUI } from "@deazl/components";

interface BarcodeScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onScanned: (barcode: string) => void;
}

export const BarcodeScannerModal = ({ isOpen, onClose, onScanned }: BarcodeScannerModalProps) => {
  if (!isOpen) return null;

  return <BarcodeScannerWithUI onClose={onClose} onScanned={onScanned} />;
};
