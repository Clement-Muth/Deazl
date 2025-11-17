"use client";

import { Button, type ButtonProps } from "@heroui/react";
import clsx from "clsx";
import { motion } from "framer-motion";
import { Plus } from "lucide-react";
import type React from "react";

interface FloatButtonProps extends ButtonProps {
  icon?: React.ReactNode;
  label?: string;
  position?: "bottom-right" | "bottom-left";
}

export const FloatingButton: React.FC<FloatButtonProps> = ({
  icon = <Plus className="w-5 h-5" />,
  label,
  position = "bottom-right",
  ...props
}) => {
  const positionClasses = position === "bottom-right" ? "bottom-22 right-6" : "bottom-22 left-6";

  return (
    <motion.div
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ type: "spring", stiffness: 200, damping: 15 }}
      // @ts-ignore
      className={`fixed z-50 ${positionClasses}`}
    >
      <Button
        color="primary"
        {...props}
        isIconOnly
        aria-label={label ?? "Floating Action Button"}
        className={clsx("rounded-full shadow-2xl w-16 h-16", props.className)}
      >
        {icon}
      </Button>
    </motion.div>
  );
};
