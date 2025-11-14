"use client";

import {
  Button,
  Card,
  CardBody,
  CardHeader,
  Chip,
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownTrigger,
  useDisclosure
} from "@heroui/react";
import { Trans } from "@lingui/react/macro";
import { motion } from "framer-motion";
import {
  ChefHat,
  Clock,
  Edit,
  Flame,
  MoreVertical,
  Printer,
  Share2,
  ShoppingCart,
  Users
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { PageHeader } from "~/components/Header/PageHeader";
import { ProductDetailPage } from "~/packages/applications/shopping-lists/src/Ui/components/ProductDetailPage";
import type { RecipePayload } from "../Domain/Schemas/Recipe.schema";
import { AddRecipeToListModal } from "./RecipeDetails/AddRecipeToListModal";
import { RecipeIngredientsWithPricing } from "./RecipeDetails/RecipeIngredientsWithPricing";
import { ShareRecipeModalNew } from "./RecipeDetails/ShareRecipeModal/ShareRecipeModalNew";
import { RecipeQualitySection } from "./RecipeQualitySection";

interface RecipeDetailsProps {
  recipe: RecipePayload;
  userId?: string;
}

export default function RecipeDetails({ recipe, userId }: RecipeDetailsProps) {
  const router = useRouter();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const { isOpen: isAddToListOpen, onOpen: onAddToListOpen, onClose: onAddToListClose } = useDisclosure();
  const [selectedProductId, setSelectedProductId] = useState<string | null>(null);

  const getDifficultyLabel = (difficulty: string) => {
    switch (difficulty) {
      case "EASY":
        return <Trans>Easy</Trans>;
      case "MEDIUM":
        return <Trans>Medium</Trans>;
      case "HARD":
        return <Trans>Hard</Trans>;
      default:
        return difficulty;
    }
  };

  const getDifficultyColorHero = (difficulty: string): "success" | "warning" | "danger" | "default" => {
    switch (difficulty) {
      case "EASY":
        return "success";
      case "MEDIUM":
        return "warning";
      case "HARD":
        return "danger";
      default:
        return "default";
    }
  };

  return (
    <div className="space-y-3 sm:space-y-4">
      {/* Header with actions */}
      <PageHeader
        title={recipe.name}
        href="/recipes"
        extra={
          <div className="flex items-center gap-2 flex-shrink-0">
            {/* Mobile: Show only primary action + menu */}
            <div className="flex sm:hidden items-center gap-1">
              <Button color="primary" size="sm" isIconOnly onPress={onAddToListOpen}>
                <ShoppingCart className="h-4 w-4" />
              </Button>
              <Dropdown placement="bottom-end">
                <DropdownTrigger>
                  <Button variant="light" size="sm" isIconOnly>
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </DropdownTrigger>
                <DropdownMenu aria-label="Recipe actions">
                  <DropdownItem key="share" startContent={<Share2 className="h-4 w-4" />} onPress={onOpen}>
                    <Trans>Share</Trans>
                  </DropdownItem>
                  <DropdownItem
                    key="edit"
                    startContent={<Edit className="h-4 w-4" />}
                    onPress={() => router.push(`/recipes/${recipe.id}/edit`)}
                  >
                    <Trans>Edit</Trans>
                  </DropdownItem>
                  <DropdownItem
                    key="print"
                    startContent={<Printer className="h-4 w-4" />}
                    onPress={() => window.print()}
                  >
                    <Trans>Print</Trans>
                  </DropdownItem>
                </DropdownMenu>
              </Dropdown>
            </div>

            {/* Desktop: Show all buttons */}
            <div className="hidden sm:flex items-center gap-2">
              <Button
                color="primary"
                size="sm"
                startContent={<ShoppingCart className="h-4 w-4" />}
                onPress={onAddToListOpen}
              >
                <Trans>Add to list</Trans>
              </Button>
              <Button
                variant="light"
                size="sm"
                startContent={<Share2 className="h-4 w-4" />}
                onPress={onOpen}
              >
                <Trans>Share</Trans>
              </Button>
              <Button
                variant="light"
                size="sm"
                startContent={<Edit className="h-4 w-4" />}
                onPress={() => router.push(`/recipes/${recipe.id}/edit`)}
              >
                <Trans>Edit</Trans>
              </Button>
              <Button variant="light" size="sm" isIconOnly onPress={() => window.print()}>
                <Printer className="h-4 w-4" />
              </Button>
            </div>
          </div>
        }
      />

      <div className="px-4">
        {/* Share Modal */}
        <ShareRecipeModalNew
          isOpen={isOpen}
          onClose={onClose}
          recipeId={recipe.id}
          recipeName={recipe.name}
          ownerId={recipe.userId}
        />

        {/* Image with animation */}
        {recipe.imageUrl && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            // @ts-ignore
            className="w-full h-48 sm:h-64 md:h-80 lg:h-96 overflow-hidden rounded-large mb-4 sm:mb-6"
          >
            <img
              src={recipe.imageUrl}
              alt={recipe.name}
              className="w-full h-full max-h-[400px] object-cover rounded-xl"
            />
          </motion.div>
        )}

        {/* Main info card with animation */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
        >
          <Card className="mb-4 sm:mb-6">
            <CardHeader className="border-b border-divider p-4 sm:p-6">
              <h1 className="text-2xl sm:text-3xl font-bold mb-1 sm:mb-2">{recipe.name}</h1>
            </CardHeader>
            <CardBody className="space-y-3 sm:space-y-4 p-4 sm:p-6">
              <div>
                {recipe.description && (
                  <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400">
                    {recipe.description}
                  </p>
                )}
              </div>

              <div className="flex flex-wrap gap-1.5 sm:gap-2">
                <Chip
                  size="md"
                  color={getDifficultyColorHero(recipe.difficulty)}
                  variant="flat"
                  className="text-xs sm:text-sm"
                >
                  {getDifficultyLabel(recipe.difficulty)}
                </Chip>
                <Chip size="md" variant="flat" className="text-xs sm:text-sm">
                  <span className="flex items-center gap-1">
                    <Users className="w-3 h-3 sm:w-4 sm:h-4" />
                    {recipe.servings} <Trans>servings</Trans>
                  </span>
                </Chip>
                <Chip size="md" variant="flat" className="text-xs sm:text-sm">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3 sm:w-4 sm:h-4" />
                    {recipe.totalTime} <Trans>min</Trans>
                  </span>
                </Chip>
                <Chip size="md" variant="flat" color="primary" className="text-xs sm:text-sm">
                  <span className="flex items-center gap-1">
                    <ChefHat className="w-3 h-3 sm:w-4 sm:h-4" />
                    <Trans>Prep.</Trans> {recipe.preparationTime} min
                  </span>
                </Chip>
                <Chip size="md" variant="flat" color="warning" className="text-xs sm:text-sm">
                  <span className="flex items-center gap-1">
                    <Flame className="w-3 h-3 sm:w-4 sm:h-4" />
                    <Trans>Cooking</Trans> {recipe.cookingTime} min
                  </span>
                </Chip>
              </div>
            </CardBody>
          </Card>
        </motion.div>

        {/* Ingredients and Steps grid with animations */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4, delay: 0.2 }}
            // @ts-ignore
            className="lg:col-span-1"
          >
            <RecipeIngredientsWithPricing
              recipeId={recipe.id}
              ingredients={recipe.ingredients || []}
              userId={userId}
              onProductClick={(productId) => setSelectedProductId(productId)}
            />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4, delay: 0.3 }}
            // @ts-ignore
            className="lg:col-span-2"
          >
            <Card>
              <CardHeader className="border-b border-divider p-4 sm:p-6">
                <h2 className="text-lg sm:text-xl font-semibold flex items-center gap-2">
                  <Flame className="w-4 h-4 sm:w-5 sm:h-5 text-warning" />
                  <Trans>Preparation</Trans>
                </h2>
              </CardHeader>
              <CardBody className="p-4 sm:p-6">
                <div className="space-y-4 sm:space-y-6">
                  {recipe.steps?.map((step, index) => (
                    <motion.div
                      key={step.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: 0.4 + index * 0.1 }}
                      // @ts-ignore
                      className="flex gap-3 sm:gap-4 p-2 sm:p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                    >
                      <div className="flex-shrink-0 w-8 h-8 sm:w-10 sm:h-10 bg-primary text-primary-foreground rounded-full flex items-center justify-center font-bold text-base sm:text-lg shadow-md">
                        {step.stepNumber}
                      </div>
                      <div className="flex-1">
                        <p className="text-sm sm:text-base text-gray-700 dark:text-gray-300 leading-relaxed">
                          {step.description}
                        </p>
                        {step.duration && (
                          <Chip
                            size="sm"
                            variant="flat"
                            color="primary"
                            startContent={<Clock className="w-3 h-3" />}
                            className="mt-2"
                          >
                            {step.duration} <Trans>min</Trans>
                          </Chip>
                        )}
                      </div>
                    </motion.div>
                  ))}
                </div>
              </CardBody>
            </Card>
          </motion.div>
        </div>

        {/* Quality section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.5 }}
          // @ts-ignore
          className="mt-6"
        >
          <RecipeQualitySection recipeId={recipe.id} />
        </motion.div>

        {/* Modals */}
        <AddRecipeToListModal isOpen={isAddToListOpen} onClose={onAddToListClose} recipe={recipe} />

        {/* Product Detail Modal */}
        {selectedProductId && (
          <ProductDetailPage
            productId={selectedProductId}
            isOpen={!!selectedProductId}
            onClose={() => setSelectedProductId(null)}
            compact
            // @ts-ignore
            fetchProduct={async (id) => {
              const { getProductWithPricesAndQuality } = await import(
                "~/packages/applications/shopping-lists/src/Api/products/getProductWithPricesAndQuality.api"
              );
              const result = await getProductWithPricesAndQuality(id);
              if (!result.success || !result.product) {
                throw new Error(result.error || "Produit introuvable");
              }
              return {
                id: result.product.id,
                name: result.product.name,
                brand: result.product.brand?.name,
                barcode: result.product.barcode,
                qualityData: result.product.qualityData || undefined,
                prices: result.product.prices.map((p) => ({
                  id: p.id,
                  productId: result.product.id,
                  storeId: p.store.id,
                  storeName: p.store.name,
                  amount: p.amount,
                  currency: p.currency,
                  unit: p.unit,
                  dateRecorded: new Date(p.dateRecorded)
                })),
                isOpenFoodFacts: result.product.isOpenFoodFacts,
                lastUpdated: new Date(result.product.updatedAt)
              };
            }}
          />
        )}
      </div>
    </div>
  );
}
