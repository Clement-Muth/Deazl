/**
 * ProductDetailPage - Complete product detail page module
 *
 * Provides a comprehensive view of product information including:
 * - Header with product name, brand, barcode, overall score
 * - Quality section (NutriScore, EcoScore, Nova, health warnings)
 * - Nutrition section (complete nutritional table with indicators)
 * - Additives section (risk levels and warnings)
 * - Allergens and labels section
 * - Ingredients section (with indicators for allergens and palm oil)
 * - Price section (with sorting/filtering by store)
 * - Actions section (add to list, compare, favorites, alternatives)
 *
 * Features:
 * - Lazy loading for performance
 * - Compact and detailed view modes
 * - Mobile-responsive with bottom sheet support
 * - Loading, error, and empty states
 * - Accordion-based organization for detailed sections
 *
 * @module ProductDetailPage
 */

// Main component
export { ProductDetailPage } from "./ProductDetailPage";
export type { ProductData } from "./ProductDetailPage";

// Individual sections (for custom compositions)
export { HeaderSection } from "./HeaderSection";
export { QualitySection } from "./QualitySection";
export { NutritionSection } from "./NutritionSection";
export { AdditivesSection } from "./AdditivesSection";
export { AllergensAndLabelsSection } from "./AllergensAndLabelsSection";
export { IngredientsSection } from "./IngredientsSection";
export { PriceSection } from "./PriceSection";
export { ActionsSection } from "./ActionsSection";
