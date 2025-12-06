"use client";

import { Avatar, Card } from "@heroui/react";
import { Trans, useLingui } from "@lingui/react/macro";
import { Calendar, Eye, Globe, Heart, User } from "lucide-react";

interface RecipeAuthorInfoProps {
  authorName?: string;
  authorImage?: string;
  createdAt?: Date;
  updatedAt?: Date;
  viewsCount?: number;
  favoritesCount?: number;
  isPublic?: boolean;
}

export function RecipeAuthorInfo({
  authorName,
  authorImage,
  createdAt,
  updatedAt,
  viewsCount = 0,
  favoritesCount = 0,
  isPublic = true
}: RecipeAuthorInfoProps) {
  const { i18n } = useLingui();

  const formatDate = (date?: Date) => {
    if (!date) return null;
    return new Intl.DateTimeFormat(i18n.locale, {
      year: "numeric",
      month: "short",
      day: "numeric"
    }).format(new Date(date));
  };

  const createdFormatted = formatDate(createdAt);
  const updatedFormatted = formatDate(updatedAt);
  const wasUpdated =
    createdAt && updatedAt && new Date(updatedAt).getTime() - new Date(createdAt).getTime() > 86400000;

  return (
    <Card className="p-4 bg-content1 border-none shadow-sm">
      <div className="flex items-center gap-4">
        <Avatar
          src={authorImage}
          name={authorName || "User"}
          size="lg"
          showFallback
          fallback={<User className="w-6 h-6 text-default-400" />}
          className="ring-2 ring-primary/20 shrink-0"
          isBordered
          color="primary"
        />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <p className="font-semibold text-foreground">{authorName || <Trans>Anonymous</Trans>}</p>
            {isPublic && (
              <span className="inline-flex items-center gap-1 text-xs text-success bg-success/10 px-2 py-0.5 rounded-full">
                <Globe className="w-3 h-3" />
                <Trans>Public</Trans>
              </span>
            )}
          </div>
          {createdFormatted && (
            <p className="text-sm text-default-500 flex items-center gap-1.5 mt-1">
              <Calendar className="w-3.5 h-3.5 shrink-0" />
              {wasUpdated ? (
                <Trans>Updated {updatedFormatted}</Trans>
              ) : (
                <Trans>Created {createdFormatted}</Trans>
              )}
            </p>
          )}
        </div>
      </div>

      {(viewsCount > 0 || favoritesCount > 0) && (
        <div className="flex items-center gap-4 mt-4 pt-3 border-t border-default-100">
          {viewsCount > 0 && (
            <div className="flex items-center gap-2 text-default-500">
              <Eye className="w-4 h-4" />
              <span className="text-sm font-medium">{viewsCount.toLocaleString()}</span>
              <span className="text-xs">
                <Trans>views</Trans>
              </span>
            </div>
          )}
          {favoritesCount > 0 && (
            <div className="flex items-center gap-2 text-danger">
              <Heart className="w-4 h-4 fill-current" />
              <span className="text-sm font-medium">{favoritesCount.toLocaleString()}</span>
              <span className="text-xs">
                <Trans>favorites</Trans>
              </span>
            </div>
          )}
        </div>
      )}
    </Card>
  );
}

export function RecipeAuthorJsonLd({
  authorName,
  authorImage
}: {
  authorName?: string;
  authorImage?: string;
}) {
  if (!authorName) return null;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Person",
    name: authorName,
    image: authorImage
  };

  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />;
}
