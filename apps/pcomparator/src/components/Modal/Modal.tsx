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
import useDevice from "~/hooks/useDevice";
import { BottomSheet } from "../BottomSheet";

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
        isOpen={isOpen}
        onClose={onClose}
        // maxHeight="100dvh"
        // closeOnOverlayClick={false}
        // closeThreshold={50}
        // onDismiss={onClose}
        // header={header}
        // footer={footer}
        // className="backdrop-blur-2xl"
        // blocking={false}
        snapPoints={
          sheetHeight === "sm"
            ? [0.3, 0.5]
            : sheetHeight === "md"
              ? [0.5, 0.75]
              : sheetHeight === "lg"
                ? [0.75, 0.9]
                : sheetHeight === "xl"
                  ? [0.9, 1]
                  : sheetHeight === "full"
                    ? [1]
                    : undefined
        }
      >
        {body}
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
