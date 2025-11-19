"use client";

import { Card, CardBody, type CardProps } from "@heroui/react";
import { type ReactNode, useCallback, useEffect, useRef, useState } from "react";
import { LongPressActionSheet } from "./LongPressActionSheet";

export interface CardAction {
  key: string;
  label: ReactNode;
  icon?: ReactNode;
  color?: "default" | "primary" | "secondary" | "success" | "warning" | "danger";
  variant?: "flat" | "solid" | "light" | "ghost" | "bordered" | "faded" | "shadow";
  onAction: () => void;
}

interface PressableCardProps extends Omit<CardProps, "onPress"> {
  children: ReactNode;
  actions?: CardAction[];
  longPressDuration?: number;
  onPress?: () => void;
  onLongPress?: () => void;
}

export const PressableCard = ({
  children,
  actions = [],
  longPressDuration = 300,
  onPress,
  onLongPress,
  ...cardProps
}: PressableCardProps) => {
  const [isActionSheetOpen, setIsActionSheetOpen] = useState(false);
  const [pressStart, setPressStart] = useState<number | null>(null);
  const longPressTimeout = useRef<NodeJS.Timeout | null>(null);
  const hasMoved = useRef(false);
  const startPosition = useRef<{ x: number; y: number } | null>(null);
  const longPressTriggered = useRef(false);

  const handlePressStart = useCallback(
    (e: React.TouchEvent | React.MouseEvent) => {
      // Reset du flag long press
      longPressTriggered.current = false;

      if ("touches" in e) {
        const touch = e.touches[0];
        startPosition.current = { x: touch.clientX, y: touch.clientY };
      } else {
        startPosition.current = { x: e.clientX, y: e.clientY };
      }

      hasMoved.current = false;
      const startTime = Date.now();
      setPressStart(startTime);

      longPressTimeout.current = setTimeout(() => {
        if (!hasMoved.current) {
          longPressTriggered.current = true;
          // Vibration feedback sur mobile
          if (navigator.vibrate) {
            navigator.vibrate(50);
          }
          setIsActionSheetOpen(true);
          onLongPress?.();
        }
      }, longPressDuration);
    },
    [longPressDuration, onLongPress]
  );

  const handlePressEnd = useCallback(() => {
    if (longPressTimeout.current) {
      clearTimeout(longPressTimeout.current);
      longPressTimeout.current = null;
    }

    const pressDuration = pressStart ? Date.now() - pressStart : 0;

    if (pressDuration < longPressDuration && !hasMoved.current && !longPressTriggered.current && onPress) {
      onPress();
    }

    setPressStart(null);
    startPosition.current = null;
  }, [pressStart, longPressDuration, onPress]);

  const handleMouseLeave = useCallback(() => {
    if (longPressTimeout.current) {
      clearTimeout(longPressTimeout.current);
      longPressTimeout.current = null;
    }

    setPressStart(null);
    startPosition.current = null;
  }, []);

  const handleMove = useCallback((e: React.TouchEvent | React.MouseEvent) => {
    if (!startPosition.current) return;

    let currentX: number;
    let currentY: number;

    if ("touches" in e) {
      const touch = e.touches[0];
      currentX = touch.clientX;
      currentY = touch.clientY;
    } else {
      currentX = e.clientX;
      currentY = e.clientY;
    }

    // Calculer la distance de mouvement
    const deltaX = Math.abs(currentX - startPosition.current.x);
    const deltaY = Math.abs(currentY - startPosition.current.y);
    const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);

    // Si le mouvement dépasse 10px, on considère que c'est un scroll
    if (distance > 10) {
      hasMoved.current = true;
      if (longPressTimeout.current) {
        clearTimeout(longPressTimeout.current);
        longPressTimeout.current = null;
      }
    }
  }, []);

  useEffect(() => {
    return () => {
      if (longPressTimeout.current) {
        clearTimeout(longPressTimeout.current);
      }
    };
  }, []);

  return (
    <>
      <div
        onTouchStartCapture={(e) => {
          if ("touches" in e) e.preventDefault();
        }}
        style={{ display: "contents" }}
      >
        <Card
          {...cardProps}
          onTouchStart={handlePressStart}
          onTouchEnd={handlePressEnd}
          onTouchMove={handleMove}
          onTouchCancel={handlePressEnd}
          onMouseDown={handlePressStart}
          onMouseUp={handlePressEnd}
          onMouseMove={handleMove}
          onMouseLeave={handleMouseLeave}
          onContextMenu={(e) => e.preventDefault()}
          style={{ touchAction: "manipulation", userSelect: "none", WebkitTouchCallout: "none" }}
          className={`transition-transform active:scale-[0.98] ${cardProps.className || ""}`}
          fullWidth
        >
          <CardBody>{children}</CardBody>
        </Card>
      </div>

      {actions.length > 0 && (
        <LongPressActionSheet
          isOpen={isActionSheetOpen}
          onClose={() => setIsActionSheetOpen(false)}
          actions={actions}
        />
      )}
    </>
  );
};
