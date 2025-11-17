"use client";

import { Card, CardBody, Link } from "@heroui/react";
import { AlertCircleIcon, InfoIcon, PackagePlusIcon } from "lucide-react";

interface EmptyStateProps {
  type: "no-prices" | "no-quality" | "no-data" | "no-similar";
  productId?: string;
  onAddPrice?: () => void;
}

export const EmptyState = ({ type, productId, onAddPrice }: EmptyStateProps) => {
  const configs = {
    "no-prices": {
      icon: <PackagePlusIcon className="h-12 w-12 text-gray-400" />,
      title: "Aucun prix disponible",
      description: "Ce produit n'a pas encore de prix enregistré. Aidez la communauté en ajoutant un prix !",
      color: "default" as const,
      action: onAddPrice ? { label: "Ajouter un prix", onClick: onAddPrice } : null
    },
    "no-quality": {
      icon: <InfoIcon className="h-12 w-12 text-gray-400" />,
      title: "Données nutritionnelles non disponibles",
      description:
        "Les informations de qualité, nutrition et additifs ne sont pas encore disponibles pour ce produit.",
      color: "default" as const,
      action: productId
        ? {
            label: "Voir sur OpenFoodFacts",
            href: `https://world.openfoodfacts.org/product/${productId}`
          }
        : null
    },
    "no-data": {
      icon: <AlertCircleIcon className="h-12 w-12 text-orange-400" />,
      title: "Informations limitées",
      description:
        "Ce produit a été ajouté manuellement et contient peu d'informations. Vous pouvez l'enrichir en scannant son code-barres.",
      color: "warning" as const,
      action: null
    },
    "no-similar": {
      icon: <InfoIcon className="h-12 w-12 text-gray-400" />,
      title: "Aucun produit similaire",
      description: "Nous n'avons pas trouvé de produits similaires pour comparer avec celui-ci.",
      color: "default" as const,
      action: null
    }
  };

  const config = configs[type];

  return (
    <Card shadow="none" className="border border-gray-200">
      <CardBody className="p-6">
        <div className="flex flex-col items-center text-center space-y-3">
          {config.icon}
          <div className="space-y-1">
            <h3 className="font-semibold text-gray-900">{config.title}</h3>
            <p className="text-sm text-gray-600 max-w-sm">{config.description}</p>
          </div>
          {config.action &&
            ("href" in config.action ? (
              <Link href={config.action.href} target="_blank" className="text-sm font-medium">
                {config.action.label} →
              </Link>
            ) : (
              <button
                type="button"
                onClick={config.action.onClick}
                className="text-sm font-medium text-primary-600 hover:text-primary-700"
              >
                {config.action.label} →
              </button>
            ))}
        </div>
      </CardBody>
    </Card>
  );
};
