import { Chip } from "@heroui/react";
import { InfoIcon } from "lucide-react";

interface HeaderSectionProps {
  productName: string;
  brandName?: string;
  barcode: string;
  isOpenFoodFacts: boolean;
  overallScore?: number;
  lastUpdated?: Date;
  imageUrl?: string;
}

/**
 * Get color class based on overall quality score
 */
function getScoreColor(score: number): "success" | "warning" | "danger" | "default" {
  if (score >= 70) return "success";
  if (score >= 50) return "warning";
  if (score >= 30) return "danger";
  return "default";
}

/**
 * HeaderSection - Product name, brand, barcode, overall score, last update
 */
export function HeaderSection({
  productName,
  brandName,
  barcode,
  isOpenFoodFacts,
  overallScore,
  lastUpdated,
  imageUrl
}: HeaderSectionProps) {
  const scoreColor = overallScore ? getScoreColor(overallScore) : "default";

  return (
    <section className="space-y-3">
      {/* Product Image */}
      {imageUrl && (
        <div className="flex justify-center">
          <img
            src={imageUrl}
            alt={productName}
            className="w-32 h-32 object-contain rounded-lg"
            loading="lazy"
          />
        </div>
      )}

      {/* Badges Row */}
      <div className="flex flex-wrap gap-2">
        {isOpenFoodFacts && (
          <Chip size="sm" variant="flat" color="success" startContent={<InfoIcon size={14} />}>
            OpenFoodFacts
          </Chip>
        )}

        {overallScore !== undefined && (
          <Chip size="sm" variant="flat" color={scoreColor} className="font-semibold">
            Score : {Math.round(overallScore)}/100
          </Chip>
        )}
      </div>

      {/* Brand */}
      {brandName && <p className="text-sm text-gray-500">{brandName}</p>}
    </section>
  );
}
