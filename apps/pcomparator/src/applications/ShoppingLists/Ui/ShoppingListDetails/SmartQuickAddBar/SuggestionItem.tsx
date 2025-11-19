import { Avatar } from "@heroui/react";
import { PackagePlusIcon, PlusIcon, SearchIcon, StoreIcon, TagIcon } from "lucide-react";
import type { SmartSuggestion } from "./useSmartProductSearch";

interface SuggestionItemProps {
  suggestion: SmartSuggestion;
}

export const SuggestionItem = ({ suggestion }: SuggestionItemProps) => {
  const getTypeIcon = () => {
    switch (suggestion.type) {
      case "product":
        return <TagIcon size={12} className="text-primary-500" />;
      case "create-product":
        return <PackagePlusIcon size={12} className="text-green-600" />;
      case "quick-add":
        return <PlusIcon size={12} className="text-gray-500" />;
      default:
        return <SearchIcon size={12} className="text-gray-400" />;
    }
  };

  const getConfidenceIndicator = () => {
    if (suggestion.confidence >= 0.8) {
      return <div className="w-2 h-2 rounded-full bg-green-500" />;
    }
    if (suggestion.confidence >= 0.6) {
      return <div className="w-2 h-2 rounded-full bg-yellow-500" />;
    }
    return <div className="w-2 h-2 rounded-full bg-gray-400" />;
  };

  return (
    <div className="flex items-center gap-2 w-full py-1">
      <div className="w-5 h-5 rounded-full bg-gray-100 flex items-center justify-center">{getTypeIcon()}</div>

      {suggestion.type === "product" && suggestion.product?.brand && (
        <Avatar size="sm" name={suggestion.product.brand.name} />
      )}

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5 mb-0.5 justify-between">
          <span className="font-medium text-sm text-foreground truncate">{suggestion.displayText}</span>
          {getConfidenceIndicator()}
        </div>

        {suggestion.type === "product" && suggestion.product && (
          <div className="flex items-center gap-2 text-xs">
            {suggestion.product.category && (
              <span className="inline-flex items-center bg-gray-100 px-1.5 py-0.5 rounded-full text-gray-600 text-xs">
                {suggestion.product.category.name}
              </span>
            )}

            {suggestion.product.bestPrice && (
              <div className="flex items-center gap-1 text-green-600 bg-green-50 px-1.5 py-0.5 rounded-full text-xs">
                <StoreIcon size={8} />
                <span className="font-medium">{suggestion.product.bestPrice.store}</span>
                {suggestion.product.bestPrice.location && (
                  <span className="text-green-500 truncate max-w-20">
                    • {suggestion.product.bestPrice.location}
                  </span>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {suggestion.type === "product" && suggestion.product?.averagePrice && (
        <div className=" text-right">
          <div className="text-xs font-bold text-primary-700">
            {suggestion.product.averagePrice.toFixed(2)}€
          </div>
          <div className="text-xs text-primary-500">moy.</div>
        </div>
      )}
    </div>
  );
};
