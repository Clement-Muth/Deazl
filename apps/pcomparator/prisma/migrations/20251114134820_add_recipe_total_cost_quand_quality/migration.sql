-- AlterTable
ALTER TABLE "Recipe" ADD COLUMN     "estimatedCostPerServing" DOUBLE PRECISION,
ADD COLUMN     "estimatedCostTotal" DOUBLE PRECISION,
ADD COLUMN     "estimatedQualityScore" INTEGER;
