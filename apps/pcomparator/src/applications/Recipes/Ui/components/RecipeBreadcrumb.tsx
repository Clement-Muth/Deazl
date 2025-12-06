"use client";

import { BreadcrumbItem, Breadcrumbs } from "@heroui/react";
import { Trans } from "@lingui/react/macro";
import { ChefHat, Home } from "lucide-react";
import Link from "next/link";

interface RecipeBreadcrumbProps {
  recipeName: string;
  category?: string | null;
  cuisine?: string | null;
}

const categoryLabels: Record<string, string> = {
  appetizer: "Appetizer",
  main_course: "Main Course",
  dessert: "Dessert",
  side_dish: "Side Dish",
  salad: "Salad",
  soup: "Soup",
  breakfast: "Breakfast",
  beverage: "Beverage",
  snack: "Snack"
};

export function RecipeBreadcrumb({ recipeName, category, cuisine }: RecipeBreadcrumbProps) {
  return (
    <nav aria-label="Breadcrumb" className="mb-4">
      <Breadcrumbs
        size="sm"
        variant="light"
        classNames={{
          list: "gap-1"
        }}
      >
        <BreadcrumbItem>
          <Link href="/" className="flex items-center gap-1.5 text-default-500 hover:text-primary">
            <Home className="w-3.5 h-3.5" />
            <Trans>Home</Trans>
          </Link>
        </BreadcrumbItem>
        <BreadcrumbItem>
          <Link href="/recipes" className="flex items-center gap-1.5 text-default-500 hover:text-primary">
            <ChefHat className="w-3.5 h-3.5" />
            <Trans>Recipes</Trans>
          </Link>
        </BreadcrumbItem>
        {category && (
          <BreadcrumbItem>
            <Link href={`/recipes?category=${category}`} className="text-default-500 hover:text-primary">
              {categoryLabels[category] || category}
            </Link>
          </BreadcrumbItem>
        )}
        {cuisine && (
          <BreadcrumbItem>
            <Link href={`/recipes?cuisine=${cuisine}`} className="text-default-500 hover:text-primary">
              {cuisine}
            </Link>
          </BreadcrumbItem>
        )}
        <BreadcrumbItem isCurrent>
          <span className="text-foreground font-medium truncate max-w-[200px]">{recipeName}</span>
        </BreadcrumbItem>
      </Breadcrumbs>
    </nav>
  );
}

export function RecipeBreadcrumbJsonLd({
  recipeName,
  recipeId,
  category,
  cuisine
}: RecipeBreadcrumbProps & { recipeId: string }) {
  const items = [
    { name: "Home", url: "https://deazl.app" },
    { name: "Recipes", url: "https://deazl.app/recipes" }
  ];

  if (category) {
    items.push({
      name: categoryLabels[category] || category,
      url: `https://deazl.app/recipes?category=${category}`
    });
  }

  if (cuisine) {
    items.push({
      name: cuisine,
      url: `https://deazl.app/recipes?cuisine=${cuisine}`
    });
  }

  items.push({
    name: recipeName,
    url: `https://deazl.app/recipes/${recipeId}`
  });

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: item.url
    }))
  };

  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />;
}
