import { Button, Dropdown, DropdownItem, DropdownMenu, DropdownTrigger } from "@heroui/react";
import { Trans } from "@lingui/react/macro";
import { Plus, ScanBarcode, Type } from "lucide-react";

interface NewPriceButtonDekstopProps {
  onOpenForm: () => void;
  onOpenModal: (type: "with" | "without") => void;
}

export const NewPriceButtonDesktop = ({ onOpenForm, onOpenModal }: NewPriceButtonDekstopProps) => (
  <Dropdown placement="bottom">
    <DropdownTrigger>
      <Button startContent={<Plus />} variant="light" radius="full" isIconOnly />
    </DropdownTrigger>
    <DropdownMenu aria-label="Profile Actions" variant="flat">
      <DropdownItem
        key="scan-barcode"
        textValue="Scan barcode"
        data-testid="scan-barcode"
        startContent={<ScanBarcode />}
        onPress={() => {
          onOpenModal("with");
          onOpenForm();
        }}
        description={<Trans>Add new price by scanning barcode</Trans>}
        shortcut="⌘C"
      >
        <Trans>Scan barcode</Trans>
      </DropdownItem>
      <DropdownItem
        key="type-barcode"
        data-testid="type-barcode"
        textValue="Type barcode"
        startContent={<Type />}
        onPress={() => {
          onOpenModal("without");
          onOpenForm();
        }}
        description={<Trans>Add new price by typing barcode</Trans>}
        shortcut="⌘N"
      >
        <Trans>Type barcode</Trans>
      </DropdownItem>
    </DropdownMenu>
  </Dropdown>
);
