import "react-spring-bottom-sheet/dist/style.css";
import {
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  Modal as ModalNextUi,
  type ModalProps as ModalNextUiProps
} from "@heroui/react";
import clsx from "clsx";
import { BottomSheet } from "react-spring-bottom-sheet";
import useDevice from "~/hooks/useDevice";

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  body: React.ReactNode;
  header?: React.ReactNode;
  footer?: React.ReactNode;
  onOpenChange?: (isOpen: boolean) => void;
  sheetHeight?: "sm" | "md" | "lg" | "xl" | "fit" | "full";
  modalProps?: Omit<ModalNextUiProps, "children">;
  isForm?: boolean;
  fullwidth?: boolean;
}

export const Modal = ({
  isOpen,
  onClose,
  onOpenChange,
  header,
  body,
  footer,
  modalProps,
  sheetHeight = "fit",
  isForm,
  fullwidth
}: ModalProps) => {
  const device = useDevice();

  if (device === "mobile") {
    return (
      <BottomSheet
        open={isOpen}
        onDismiss={onClose}
        header={header}
        footer={footer}
        snapPoints={({ maxHeight, minHeight }) => {
          switch (sheetHeight) {
            case "sm":
              return maxHeight / 4;
            case "full":
              return maxHeight;
            case "xl":
              return (maxHeight * 3.5) / 4;
            case "lg":
              return maxHeight / 1.5;
            case "md":
              return maxHeight / 2;
            default:
              return minHeight;
          }
        }}
      >
        <div className={clsx(fullwidth ? "p-0" : "p-4", "flex flex-col h-full pointer-events-auto gap-4")}>
          {body}
        </div>
      </BottomSheet>
    );
  }

  return (
    <ModalNextUi isOpen={isOpen} onClose={onClose} onOpenChange={onOpenChange} {...modalProps}>
      <ModalContent>
        <ModalHeader>{header}</ModalHeader>
        <ModalBody className={clsx(isForm && "!mb-3")}>{body}</ModalBody>
        {!isForm && <ModalFooter>{footer}</ModalFooter>}
      </ModalContent>
    </ModalNextUi>
  );
};
