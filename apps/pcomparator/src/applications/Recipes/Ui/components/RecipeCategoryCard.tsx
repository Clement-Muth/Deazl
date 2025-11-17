"use client";

import { Card, CardBody } from "@heroui/react";
import { ChefHat } from "lucide-react";
import { useRouter } from "next/navigation";

interface RecipeCategoryCardProps {
  name: string;
  slug: string;
  count: number;
  icon?: React.ReactNode;
  imageUrl?: string;
}

export function RecipeCategoryCard({ name, slug, count, icon, imageUrl }: RecipeCategoryCardProps) {
  const router = useRouter();

  return (
    <Card
      isPressable
      onPress={() => router.push(`/recipes/explore?category=${slug}`)}
      className="hover:scale-105 transition-transform"
    >
      <CardBody className="p-0">
        <div className="relative w-full h-32 overflow-hidden">
          {imageUrl ? (
            <img src={imageUrl} alt={name} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-primary-200 to-primary-400 flex items-center justify-center">
              {icon || <ChefHat className="w-10 h-10 text-white opacity-80" />}
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
          <div className="absolute bottom-3 left-3 right-3">
            <h3 className="text-white font-bold text-lg">{name}</h3>
            <p className="text-white/90 text-sm">{count} recettes</p>
          </div>
        </div>
      </CardBody>
    </Card>
  );
}
