import { Button, Card } from "@heroui/react";
import { GitCompare, Heart, Plus, Search } from "lucide-react";

interface ActionsSectionProps {
  onAddToList?: () => void;
  onCompare?: () => void;
  onViewAlternatives?: () => void;
  onAddToFavorites?: () => void;
  isInFavorites?: boolean;
  isInList?: boolean;
  compact?: boolean;
}

/**
 * ActionsSection - Action buttons for product interactions
 */
export function ActionsSection({
  onAddToList,
  onCompare,
  onViewAlternatives,
  onAddToFavorites,
  isInFavorites = false,
  isInList = false,
  compact = false
}: ActionsSectionProps) {
  if (compact) {
    return (
      <section className="space-y-3">
        <div className="flex flex-col gap-2">
          {onAddToList && (
            <Button
              color={isInList ? "success" : "primary"}
              variant={isInList ? "flat" : "solid"}
              onPress={onAddToList}
              startContent={<Plus size={18} />}
              size="lg"
              className="w-full"
            >
              {isInList ? "Déjà dans la liste" : "Ajouter à la liste"}
            </Button>
          )}

          {onCompare && (
            <Button
              color="primary"
              variant="flat"
              onPress={onCompare}
              startContent={<GitCompare size={18} />}
              size="lg"
              className="w-full"
            >
              Comparer avec d'autres produits
            </Button>
          )}

          {onViewAlternatives && (
            <Button
              color="default"
              variant="flat"
              onPress={onViewAlternatives}
              startContent={<Search size={18} />}
              size="lg"
              className="w-full"
            >
              Voir les alternatives
            </Button>
          )}

          {onAddToFavorites && (
            <Button
              color={isInFavorites ? "danger" : "default"}
              variant="flat"
              onPress={onAddToFavorites}
              startContent={<Heart size={18} fill={isInFavorites ? "currentColor" : "none"} />}
              size="lg"
              className="w-full"
            >
              {isInFavorites ? "Retirer des favoris" : "Ajouter aux favoris"}
            </Button>
          )}
        </div>
      </section>
    );
  }

  // Detailed view with better layout
  return (
    <Card className="p-4 mb-4 shadow-sm">
      <h3 className="text-lg font-semibold text-foreground mb-4">Actions</h3>

      <div className="space-y-3">
        {/* Primary actions */}
        <div className="grid grid-cols-2 gap-3">
          {onAddToList && (
            <Button
              color={isInList ? "success" : "primary"}
              variant={isInList ? "flat" : "solid"}
              onPress={onAddToList}
              startContent={<Plus size={20} />}
              size="lg"
              className="font-semibold"
            >
              {isInList ? "Déjà dans la liste" : "Ajouter à la liste"}
            </Button>
          )}

          {onAddToFavorites && (
            <Button
              color={isInFavorites ? "danger" : "default"}
              variant={isInFavorites ? "flat" : "bordered"}
              onPress={onAddToFavorites}
              startContent={<Heart size={20} fill={isInFavorites ? "currentColor" : "none"} />}
              size="lg"
              className="font-semibold"
            >
              {isInFavorites ? "Retirer des favoris" : "Ajouter aux favoris"}
            </Button>
          )}
        </div>

        {/* Secondary actions */}
        <div className="grid grid-cols-2 gap-3">
          {onCompare && (
            <Button
              color="default"
              variant="flat"
              onPress={onCompare}
              startContent={<GitCompare size={20} />}
              size="lg"
            >
              Comparer les produits
            </Button>
          )}

          {onViewAlternatives && (
            <Button
              color="default"
              variant="bordered"
              onPress={onViewAlternatives}
              startContent={<Search size={20} />}
              size="lg"
            >
              Voir les alternatives
            </Button>
          )}
        </div>
      </div>

      {/* Action descriptions */}
      <div className="mt-4 pt-4 border-t border-divider">
        <div className="space-y-2 text-xs text-foreground-500">
          {onAddToList && (
            <div className="flex items-start gap-2">
              <Plus size={14} className="mt-0.5" />
              <p>Ajoutez ce produit à votre liste de courses pour planifier vos achats</p>
            </div>
          )}

          {onCompare && (
            <div className="flex items-start gap-2">
              <GitCompare size={14} className="mt-0.5" />
              <p>Comparez ce produit avec d'autres produits similaires pour trouver la meilleure option</p>
            </div>
          )}

          {onViewAlternatives && (
            <div className="flex items-start gap-2">
              <Search size={14} className="mt-0.5" />
              <p>Découvrez des alternatives avec une meilleure qualité nutritionnelle ou un meilleur prix</p>
            </div>
          )}

          {onAddToFavorites && (
            <div className="flex items-start gap-2">
              <Heart size={14} className="mt-0.5" />
              <p>Enregistrez ce produit dans vos favoris pour y accéder rapidement</p>
            </div>
          )}
        </div>
      </div>
    </Card>
  );
}
