"use client";

import { Button } from "@heroui/react";
import { Trans } from "@lingui/react/macro";
import { useRouter } from "next/navigation";

interface LoginCTAProps {
  message?: string;
  variant?: "default" | "banner" | "inline";
  className?: string;
}

export function LoginCTA({ message, variant = "default", className = "" }: LoginCTAProps) {
  const router = useRouter();

  const handleLogin = () => {
    router.push("/auth/login");
  };

  const handleSignup = () => {
    router.push("/auth/signup");
  };

  if (variant === "banner") {
    return (
      <div
        className={`flex flex-col items-center justify-center gap-4 rounded-xl border-2 border-dashed border-default-300 bg-default-50 p-8 text-center ${className}`}
      >
        <p className="text-lg font-medium text-default-700">
          {message || <Trans>Créez un compte pour accéder à cette fonctionnalité</Trans>}
        </p>
        <div className="flex gap-3">
          <Button color="primary" onPress={handleLogin}>
            <Trans>Se connecter</Trans>
          </Button>
          <Button variant="bordered" onPress={handleSignup}>
            <Trans>Créer un compte</Trans>
          </Button>
        </div>
      </div>
    );
  }

  if (variant === "inline") {
    return (
      <div className={`flex items-center gap-3 ${className}`}>
        <span className="text-sm text-default-600">
          {message || <Trans>Connectez-vous pour continuer</Trans>}
        </span>
        <Button size="sm" color="primary" onPress={handleLogin}>
          <Trans>Se connecter</Trans>
        </Button>
      </div>
    );
  }

  return (
    <div className={`flex flex-col items-center gap-4 ${className}`}>
      <p className="text-center text-default-600">
        {message || <Trans>Créez un compte pour utiliser cette fonctionnalité</Trans>}
      </p>
      <div className="flex gap-3">
        <Button color="primary" onPress={handleLogin}>
          <Trans>Se connecter</Trans>
        </Button>
        <Button variant="flat" onPress={handleSignup}>
          <Trans>Créer un compte</Trans>
        </Button>
      </div>
    </div>
  );
}
