import {
  Button,
  DropdownItem,
  type DropdownItemProps,
  DropdownMenu,
  Dropdown as DropdownNextUi,
  type DropdownProps as DropdownNextUiProps
} from "@heroui/react";
import clsx from "clsx";
import type { ReactNode, RefObject } from "react";
import { BottomSheet } from "react-spring-bottom-sheet";
import useDevice from "~/hooks/useDevice";

export interface DropdownProps {
  isOpen: boolean;
  triggerRef?: RefObject<HTMLElement>;
  onClose: () => void;
  body?: React.ReactNode;
  header?: React.ReactNode;
  footer?: React.ReactNode;
  onOpenChange?: (isOpen: boolean) => void;
  sheetHeight?: "sm" | "md" | "lg" | "fit" | "full";
  dropdownProps?: Omit<DropdownNextUiProps, "children">;
  dropdownItems: (DropdownItemProps & { label: ReactNode })[];
  isForm?: boolean;
  fullwidth?: boolean;
}

export const Dropdown = ({
  isOpen,
  onClose,
  onOpenChange,
  header,
  footer,
  dropdownProps,
  sheetHeight = "fit",
  triggerRef,
  dropdownItems,
  fullwidth
}: DropdownProps) => {
  const device = useDevice();

  if (device === "mobile") {
    return (
      <BottomSheet
        open={isOpen}
        onDismiss={onClose}
        expandOnContentDrag
        header={header}
        footer={footer}
        snapPoints={({ maxHeight, minHeight }) => {
          switch (sheetHeight) {
            case "sm":
              return maxHeight / 4;
            case "full":
              return maxHeight;
            case "lg":
              return maxHeight / 1.5;
            case "md":
              return maxHeight / 2;
            default:
              return minHeight;
          }
        }}
      >
        <div className={clsx(fullwidth ? "p-0" : "p-4", "flex flex-col h-full gap-y-4 pointer-events-auto")}>
          {dropdownItems.map(({ label, key, ...item }) => (
            // @ts-ignore
            <Button type="button" variant="flat" key={key} size="lg" {...item} fullWidth>
              {label}
            </Button>
          ))}
        </div>
      </BottomSheet>
    );
  }

  return (
    <DropdownNextUi isOpen={isOpen} triggerRef={triggerRef} onClose={onClose} onOpenChange={onOpenChange}>
      <div />
      <DropdownMenu aria-label="Dynamic Actions" items={dropdownItems}>
        {(item) => (
          <DropdownItem {...item} key={item.key}>
            {item.label}
          </DropdownItem>
        )}
      </DropdownMenu>
    </DropdownNextUi>
  );
};
