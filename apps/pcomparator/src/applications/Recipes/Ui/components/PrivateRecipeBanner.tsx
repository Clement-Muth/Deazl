"use client";

import { Card, CardBody } from "@heroui/react";
import { Trans } from "@lingui/react/macro";
import { Lock } from "lucide-react";
import { LoginCTA } from "./LoginCTA";

interface PrivateRecipeBannerProps {
  recipeName?: string;
  className?: string;
}

export function PrivateRecipeBanner({ recipeName, className = "" }: PrivateRecipeBannerProps) {
  return (
    <div className={`flex min-h-[60vh] items-center justify-center p-4 ${className}`}>
      <Card className="max-w-lg">
        <CardBody className="gap-6 p-8 text-center">
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-default-100">
            <Lock className="h-10 w-10 text-default-400" />
          </div>

          <div className="space-y-2">
            <h2 className="text-2xl font-bold text-default-900">
              <Trans>Recette privée</Trans>
            </h2>
            {recipeName && (
              <p className="text-lg text-default-600">
                <Trans>"{recipeName}"</Trans>
              </p>
            )}
          </div>

          <p className="text-default-500">
            <Trans>Cette recette est privée. Le créateur n'a pas autorisé l'accès public.</Trans>
          </p>

          <LoginCTA message="Connectez-vous pour accéder à vos recettes privées" variant="default" />
        </CardBody>
      </Card>
    </div>
  );
}
