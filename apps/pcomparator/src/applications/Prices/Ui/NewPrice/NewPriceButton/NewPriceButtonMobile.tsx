import { Button } from "@heroui/react";
import { Trans } from "@lingui/react/macro";
import { Plus, ScanBarcode, Type } from "lucide-react";
import { Modal } from "~/components/Modal/Modal";

interface NewPriceButtonMobileProps {
  isOpen: boolean;
  onOpen: () => void;
  onClose: () => void;
  onOpenForm: () => void;
  onOpenModal: (type: "with" | "without") => void;
}

export const NewPriceButtonMobile = ({
  isOpen,
  onOpen,
  onClose,
  onOpenForm,
  onOpenModal
}: NewPriceButtonMobileProps) => (
  <>
    <Button startContent={<Plus />} variant="light" radius="full" onPress={onOpen} isIconOnly />
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      body={
        <div className="p-4 flex flex-col gap-y-2 w-full">
          <Button
            key="scan-barcode"
            data-testid="scan-barcode"
            startContent={<ScanBarcode />}
            size="lg"
            variant="flat"
            color="primary"
            fullWidth
            onPress={() => {
              onOpenModal("with");
              onClose();
              onOpenForm();
            }}
          >
            <Trans>Scan barcode</Trans>
          </Button>
          <Button
            key="type-barcode"
            data-testid="type-barcode"
            startContent={<Type />}
            size="lg"
            variant="flat"
            color="primary"
            fullWidth
            onPress={() => {
              onOpenModal("without");
              onClose();
              onOpenForm();
            }}
          >
            <Trans>Type barcode</Trans>
          </Button>
        </div>
      }
    />
  </>
);
