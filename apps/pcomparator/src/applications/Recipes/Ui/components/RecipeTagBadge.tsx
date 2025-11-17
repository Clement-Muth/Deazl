import { Chip } from "@heroui/react";
import type { ReactNode } from "react";

interface RecipeTagBadgeProps {
  children: ReactNode;
  variant?: "flat" | "solid" | "bordered" | "light" | "faded" | "shadow";
  color?: "default" | "primary" | "secondary" | "success" | "warning" | "danger";
  size?: "sm" | "md" | "lg";
  icon?: ReactNode;
}

export function RecipeTagBadge({
  children,
  variant = "flat",
  color = "default",
  size = "sm",
  icon
}: RecipeTagBadgeProps) {
  return (
    <Chip variant={variant} color={color} size={size} startContent={icon}>
      {children}
    </Chip>
  );
}
