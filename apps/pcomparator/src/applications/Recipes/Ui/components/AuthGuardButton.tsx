"use client";

import { Button, type ButtonProps } from "@heroui/react";
import { useRouter } from "next/navigation";

interface AuthGuardButtonProps extends Omit<ButtonProps, "onPress"> {
  isAuthenticated: boolean;
  onAuthenticatedAction?: () => void | Promise<void>;
  loginMessage?: string;
}

/**
 * Button that redirects to login if user is not authenticated,
 * or executes the action if authenticated.
 */
export function AuthGuardButton({
  isAuthenticated,
  onAuthenticatedAction,
  loginMessage = "Vous devez être connecté pour effectuer cette action",
  children,
  ...buttonProps
}: AuthGuardButtonProps) {
  const router = useRouter();

  const handleClick = async () => {
    if (!isAuthenticated) {
      router.push("/auth/signin");
      return;
    }

    if (onAuthenticatedAction) {
      await onAuthenticatedAction();
    }
  };

  return (
    <Button {...buttonProps} onPress={handleClick}>
      {children}
    </Button>
  );
}
