"use client";

import { Button } from "@heroui/react";
import { ScanBarcode } from "lucide-react";

interface BarcodeScannerButtonProps {
  onPress: () => void;
}

export const BarcodeScannerButton = ({ onPress }: BarcodeScannerButtonProps) => {
  return (
    <Button
      startContent={<ScanBarcode />}
      onPress={onPress}
      radius="full"
      variant="shadow"
      size="lg"
      className="w-18 h-18 -mt-10 bg-content2 border-none"
      isIconOnly
    />
  );
};
