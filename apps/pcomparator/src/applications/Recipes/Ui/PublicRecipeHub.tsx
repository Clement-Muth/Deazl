"use client";

import { Button, Chip, Link } from "@heroui/react";
import { Trans, useLingui } from "@lingui/react/macro";
import { Flame, Sparkles, TrendingUp } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { PageHeader } from "~/components/Header/PageHeader";
import useDevice from "~/hooks/useDevice";
import type { PublicRecipeHubData } from "../Application/Services/PublicRecipeHub.service";
import { LoginCTA } from "./components/LoginCTA";
import { RecipeCategoryCard } from "./components/RecipeCategoryCard";
import { RecipeHorizontalList } from "./components/RecipeHorizontalList";
import { RecipeSearchBar } from "./components/RecipeSearchBar";

interface PublicRecipeHubProps {
  hubData: PublicRecipeHubData;
  isAuthenticated: boolean;
}

export function PublicRecipeHub({ hubData, isAuthenticated }: PublicRecipeHubProps) {
  const router = useRouter();
  const device = useDevice();
  const { t } = useLingui();
  const [searchQuery, setSearchQuery] = useState("");

  const handleSearch = async (query: string) => {
    setSearchQuery(query);
    if (query.trim()) {
      router.push(`/recipes/search?q=${encodeURIComponent(query)}`);
    }
  };

  const handleCategoryClick = (category: string) => {
    router.push(`/recipes/explore?category=${encodeURIComponent(category)}`);
  };

  const handleCuisineClick = (cuisine: string) => {
    router.push(`/recipes/explore?cuisine=${encodeURIComponent(cuisine)}`);
  };

  const handleTagClick = (tag: string) => {
    router.push(`/recipes/explore?tag=${encodeURIComponent(tag)}`);
  };

  return (
    <div className="container mx-auto w-full">
      <PageHeader title={<Trans>Discover recipes</Trans>} />

      <div className="space-y-8 p-4">
        <div className="mb-8">
          <RecipeSearchBar onSearch={handleSearch} placeholder={t`Search recipes...`} />
        </div>

        {!isAuthenticated && (
          <div className="mb-8">
            <LoginCTA
              message={t`Create an account to access personalized features, save your favorite recipes, and get tailored recommendations`}
              variant="banner"
            />
          </div>
        )}

        {hubData.trending.items.length > 0 && (
          <section className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-danger" />
                <h2 className="text-2xl font-bold">
                  <Trans>Trending</Trans>
                </h2>
              </div>
              <Button
                variant="light"
                size="sm"
                as={Link}
                href="/recipes/trending"
                endContent={<Sparkles className="h-4 w-4" />}
              >
                <Trans>See all</Trans>
              </Button>
            </div>

            <RecipeHorizontalList
              title={t`Trending`}
              recipes={hubData.trending.items.map((item) => item.recipe)}
            />
          </section>
        )}

        {hubData.recent.items.length > 0 && (
          <section className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Flame className="h-5 w-5 text-warning" />
                <h2 className="text-2xl font-bold">
                  <Trans>New recipes</Trans>
                </h2>
              </div>
              <Button
                variant="light"
                size="sm"
                as={Link}
                href="/recipes/recent"
                endContent={<Sparkles className="h-4 w-4" />}
              >
                <Trans>See all</Trans>
              </Button>
            </div>

            <RecipeHorizontalList title={t`New recipes`} recipes={hubData.recent.items} />
          </section>
        )}

        {hubData.categories.length > 0 && (
          <section className="space-y-4">
            <h2 className="text-2xl font-bold">
              <Trans>Categories</Trans>
            </h2>
            <div className="grid grid-cols-2 gap-3 md:grid-cols-4 lg:grid-cols-6">
              {hubData.categories.slice(0, 12).map((cat) => (
                <RecipeCategoryCard
                  key={cat.category}
                  name={cat.category}
                  slug={cat.category.toLowerCase().replace(/\s+/g, "-")}
                  count={cat.count}
                />
              ))}
            </div>
          </section>
        )}

        {hubData.cuisines.length > 0 && (
          <section className="space-y-4">
            <h2 className="text-2xl font-bold">
              <Trans>World Cuisines</Trans>
            </h2>
            <div className="grid grid-cols-2 gap-3 md:grid-cols-4 lg:grid-cols-6">
              {hubData.cuisines.slice(0, 12).map((cui) => (
                <RecipeCategoryCard
                  key={cui.cuisine}
                  name={cui.cuisine}
                  slug={cui.cuisine.toLowerCase().replace(/\s+/g, "-")}
                  count={cui.count}
                />
              ))}
            </div>
          </section>
        )}

        {hubData.popularTags.length > 0 && (
          <section className="space-y-4">
            <h2 className="text-2xl font-bold">
              <Trans>Popular Tags</Trans>
            </h2>
            <div className="flex flex-wrap gap-2">
              {hubData.popularTags.slice(0, 20).map((tag) => (
                <Chip
                  key={tag.tag}
                  variant="flat"
                  className="cursor-pointer hover:bg-primary hover:text-primary-foreground"
                  onClick={() => handleTagClick(tag.tag)}
                >
                  {tag.tag} ({tag.count})
                </Chip>
              ))}
            </div>
          </section>
        )}

        <div className="text-center pt-8 pb-4 text-sm text-default-500">
          <Trans>{hubData.totalRecipes} public recipes available</Trans>
        </div>
      </div>
    </div>
  );
}
