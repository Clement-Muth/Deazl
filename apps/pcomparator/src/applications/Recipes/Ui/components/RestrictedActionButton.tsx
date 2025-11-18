"use client";

import { Button } from "@heroui/react";
import { useRouter } from "next/navigation";
import type { ReactNode } from "react";

interface RestrictedActionButtonProps {
  children: ReactNode;
  isAuthenticated: boolean;
  onAction?: () => void;
  message?: string;
  variant?: "solid" | "flat" | "bordered" | "light" | "faded" | "shadow" | "ghost";
  color?: "default" | "primary" | "secondary" | "success" | "warning" | "danger";
  size?: "sm" | "md" | "lg";
  className?: string;
  isDisabled?: boolean;
}

export function RestrictedActionButton({
  children,
  isAuthenticated,
  onAction,
  message,
  variant = "solid",
  color = "primary",
  size = "md",
  className = "",
  isDisabled = false
}: RestrictedActionButtonProps) {
  const router = useRouter();

  const handleClick = () => {
    if (!isAuthenticated) {
      router.push("/auth/login");
      return;
    }

    if (onAction) {
      onAction();
    }
  };

  if (!isAuthenticated && message) {
    return (
      <div className="flex flex-col gap-2">
        <Button
          variant={variant}
          color={color}
          size={size}
          className={className}
          onPress={handleClick}
          isDisabled={isDisabled}
        >
          {children}
        </Button>
        <p className="text-xs text-default-500">{message}</p>
      </div>
    );
  }

  return (
    <Button
      variant={variant}
      color={color}
      size={size}
      className={className}
      onPress={handleClick}
      isDisabled={isDisabled}
    >
      {children}
    </Button>
  );
}
