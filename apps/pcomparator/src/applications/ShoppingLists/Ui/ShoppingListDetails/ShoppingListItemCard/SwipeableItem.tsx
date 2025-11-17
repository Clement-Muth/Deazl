"use client";

import { animate, motion, useMotionValue, useTransform } from "framer-motion";
import { CheckIcon, TrashIcon } from "lucide-react";
import { type ReactNode, useEffect, useState } from "react";

interface SwipeableItemProps {
  children: ReactNode;
  onSwipeLeft: () => void;
  onSwipeRight: () => void;
  isCompleted: boolean;
  disabled?: boolean;
}

const SWIPE_THRESHOLD = 100;
const SWIPE_VELOCITY = 500;

export const SwipeableItem = ({
  children,
  onSwipeLeft,
  onSwipeRight,
  isCompleted,
  disabled = false
}: SwipeableItemProps) => {
  const x = useMotionValue(0);
  const [isDragging, setIsDragging] = useState(false);
  const [lastTap, setLastTap] = useState(0);

  // Background color that transitions based on swipe direction
  const backgroundColor = useTransform(
    x,
    [-200, -50, 0, 50, 200],
    ["#ef4444", "#ef4444", "#f3f4f6", "#22c55e", "#22c55e"]
  );

  // Icon opacity
  const leftIconOpacity = useTransform(x, [-100, -50, 0], [1, 0.5, 0]);
  const rightIconOpacity = useTransform(x, [0, 50, 100], [0, 0.5, 1]);

  // Handle drag end
  const handleDragEnd = (_event: any, info: { offset: { x: number }; velocity: { x: number } }) => {
    setIsDragging(false);
    const offset = info.offset.x;
    const velocity = info.velocity.x;

    // Check if action should trigger
    const shouldSwipeLeft = offset < -SWIPE_THRESHOLD || velocity < -SWIPE_VELOCITY;
    const shouldSwipeRight = offset > SWIPE_THRESHOLD || velocity > SWIPE_VELOCITY;

    // Reset position with animation
    animate(x, 0, { type: "spring", stiffness: 300, damping: 30 });

    // Trigger actions after reset animation starts
    if (shouldSwipeLeft) {
      setTimeout(() => onSwipeLeft(), 100);
    } else if (shouldSwipeRight) {
      setTimeout(() => onSwipeRight(), 100);
    }
  };

  // Handle double tap
  const handleTap = () => {
    const now = Date.now();
    const timeSinceLastTap = now - lastTap;

    if (timeSinceLastTap < 300 && timeSinceLastTap > 0) {
      // Double tap detected
      onSwipeRight();
    }

    setLastTap(now);
  };

  // Reset position when item state changes (completed/uncompleted)
  useEffect(() => {
    x.set(0);
  }, [isCompleted, x]);

  // Add haptic feedback on iOS/Android
  useEffect(() => {
    const unsubscribe = x.on("change", (latest) => {
      if (Math.abs(latest) > 80 && !isDragging) {
        // Trigger haptic feedback at threshold
        if ("vibrate" in navigator) {
          navigator.vibrate(10);
        }
      }
    });

    return () => unsubscribe();
  }, [x, isDragging]);

  if (disabled) {
    return <div>{children}</div>;
  }

  return (
    <div className="relative overflow-hidden rounded-large">
      {/* Colored background layer */}
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
        onDragStart={() => setIsDragging(true)}
        onDragEnd={handleDragEnd}
        onTap={handleTap}
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
