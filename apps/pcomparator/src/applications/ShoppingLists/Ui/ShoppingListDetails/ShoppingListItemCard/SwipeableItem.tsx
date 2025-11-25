"use client";

import { animate, motion, useMotionValue, useTransform } from "framer-motion";
import { CheckIcon, TrashIcon } from "lucide-react";
import { useTheme } from "next-themes";
import { type ReactNode, useEffect, useState } from "react";

interface SwipeableItemProps {
  children: ReactNode;
  onSwipeLeft: () => void;
  onSwipeRight: () => void;
  isCompleted: boolean;
  disabled?: boolean;
  onPress?: (e: any) => void;
  onLongPress?: () => void;
}

const SWIPE_THRESHOLD = 100;
const SWIPE_VELOCITY = 500;

export const SwipeableItem = ({
  children,
  onSwipeLeft,
  onSwipeRight,
  isCompleted,
  disabled = false,
  onPress,
  onLongPress
}: SwipeableItemProps) => {
  const { theme } = useTheme();
  const x = useMotionValue(0);
  const [isDragging, setIsDragging] = useState(false);
  const [lastTap, setLastTap] = useState(0);
  const [hasSwiped, setHasSwiped] = useState(false);
  const [longPressTimer, setLongPressTimer] = useState<NodeJS.Timeout | null>(null);
  const [hasLongPressed, setHasLongPressed] = useState(false);

  const backgroundColor = useTransform(
    x,
    [-200, -50, 0, 50, 200],
    ["#ef4444", "#ef4444", theme === "light" ? "#fff" : "#000", "#22c55e", "#22c55e"]
  );

  const leftIconOpacity = useTransform(x, [-100, -50, 0], [1, 0.5, 0]);
  const rightIconOpacity = useTransform(x, [0, 50, 100], [0, 0.5, 1]);

  const handleDragEnd = (_event: any, info: { offset: { x: number }; velocity: { x: number } }) => {
    _event.stopPropagation();
    setIsDragging(false);
    const offset = info.offset.x;
    const velocity = info.velocity.x;

    const shouldSwipeLeft = offset < -SWIPE_THRESHOLD || velocity < -SWIPE_VELOCITY;
    const shouldSwipeRight = offset > SWIPE_THRESHOLD || velocity > SWIPE_VELOCITY;

    animate(x, 0, { type: "spring", stiffness: 300, damping: 30 });

    if (shouldSwipeLeft) {
      setTimeout(() => {
        setHasSwiped(true);
        onSwipeLeft();
        setTimeout(() => setHasSwiped(false), 100);
      }, 100);
    } else if (shouldSwipeRight) {
      setTimeout(() => {
        setHasSwiped(true);
        onSwipeRight();
        setTimeout(() => setHasSwiped(false), 100);
      }, 100);
    }
  };

  const handleTap = () => {
    const now = Date.now();
    const timeSinceLastTap = now - lastTap;

    if (timeSinceLastTap < 300 && timeSinceLastTap > 0) {
      onSwipeRight();
    }

    setLastTap(now);
  };

  const handlePressStart = () => {
    if (hasSwiped || isDragging) return;
    setHasLongPressed(false);
    const timer = setTimeout(() => {
      setHasLongPressed(true);
      if (onLongPress) {
        onLongPress();
      }
    }, 500); // 500ms for long press
    setLongPressTimer(timer);
  };

  const handlePressEnd = () => {
    if (longPressTimer) {
      clearTimeout(longPressTimer);
      setLongPressTimer(null);
    }
  };

  const handlePress = (e: React.MouseEvent | React.TouchEvent) => {
    if (hasSwiped || isDragging || hasLongPressed) {
      return;
    }
    onPress?.(e);
  };

  useEffect(() => {
    x.set(0);
  }, [isCompleted, x]);

  useEffect(() => {
    const unsubscribe = x.on("change", (latest) => {
      if (Math.abs(latest) > 80 && !isDragging) {
        if ("vibrate" in navigator) navigator.vibrate(10);
      }
    });

    return () => unsubscribe();
  }, [x, isDragging]);

  if (disabled) {
    return <div>{children}</div>;
  }

  return (
    <div className="relative overflow-hidden rounded-large" onClick={handlePress}>
      <motion.div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor,
          zIndex: 0
        }}
      />

      {/* Icons layer - above background */}
      <div className="absolute inset-0 flex items-center justify-between px-6" style={{ zIndex: 1 }}>
        {/* Left action (Delete) - visible when swiping right */}
        <motion.div
          style={{
            opacity: rightIconOpacity,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: "0.25rem",
            zIndex: 1
          }}
        >
          <CheckIcon className="h-4 w-5 text-white" />
          <span className="text-xs text-white uppercase tracking-wide">{isCompleted ? "Undo" : "Done"}</span>
        </motion.div>

        {/* Right action (Complete) - visible when swiping left */}
        <motion.div
          style={{
            opacity: leftIconOpacity,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: "0.25rem",
            zIndex: 1
          }}
        >
          <TrashIcon className="h-4 w-5 text-white" />
          <span className="text-xs text-white uppercase tracking-wide">Delete</span>
        </motion.div>
      </div>

      {/* Draggable content */}
      <motion.div
        drag="x"
        dragConstraints={{ left: -200, right: 200 }}
        dragElastic={0.2}
        onDragStart={(e) => {
          e.stopImmediatePropagation();
          setIsDragging(true);
          // Clear long press timer if dragging starts
          if (longPressTimer) {
            clearTimeout(longPressTimer);
            setLongPressTimer(null);
          }
        }}
        onDragEnd={handleDragEnd}
        onTap={handleTap}
        onMouseDown={handlePressStart}
        onMouseUp={handlePressEnd}
        onTouchStart={handlePressStart}
        onTouchEnd={handlePressEnd}
        style={{
          x,
          position: "relative",
          zIndex: 10,
          cursor: isDragging ? "grabbing" : "grab",
          touchAction: "pan-y"
        }}
        whileTap={{ scale: 0.98 }}
      >
        {children}
      </motion.div>
    </div>
  );
};
