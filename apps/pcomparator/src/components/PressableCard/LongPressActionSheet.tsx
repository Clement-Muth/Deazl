"use client";

import { Button } from "@heroui/react";
import { Modal } from "../Modal/Modal";
import type { CardAction } from "./PressableCard";

interface LongPressActionSheetProps {
  isOpen: boolean;
  onClose: () => void;
  actions: CardAction[];
}

export const LongPressActionSheet = ({ isOpen, onClose, actions }: LongPressActionSheetProps) => {
  const handleAction = (action: CardAction) => {
    action.onAction();
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      body={
        <div className="inline-flex flex-col w-full">
          {actions.map((action, index) => {
            const isFirst = index === 0;
            const isLast = index === actions.length - 1;

            const roundedClasses = `${
              isFirst ? "rounded-t-lg" : ""
            } ${isLast ? "rounded-b-lg" : ""} ${!isFirst && !isLast ? "rounded-none" : ""}`;

            return (
              <Button
                key={index}
                className={`rounded-t-none rounded-b-none ${roundedClasses}`}
                color={action.color}
                size="lg"
                variant={action.variant}
                onPress={handleAction.bind(null, action)}
                fullWidth
              >
                {action.label}
              </Button>
            );
          })}
        </div>
      }
    />
  );
};
