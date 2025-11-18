/**
 * Script de migration pour ajouter les noms d'additifs aux produits existants
 * Usage: npx tsx scripts/migrate-additives.ts
 */

import { PrismaClient } from "@prisma/client";
import { getAdditiveInfo } from "../src/applications/Recipes/Domain/Services/AdditiveDatabase";

const prisma = new PrismaClient();

async function migrateAdditives() {
  console.log("🚀 Starting additives migration...\n");

  try {
    // Récupérer tous les produits
    const products = await prisma.product.findMany();

    console.log(`📦 Found ${products.length} products with nutrition_score data\n`);

    let updatedCount = 0;
    let skippedCount = 0;
    let errorCount = 0;

    for (const product of products) {
      try {
        const nutritionScore = product.nutrition_score as any;

        // Vérifier si le produit a des additifs
        if (!nutritionScore?.additives || !Array.isArray(nutritionScore.additives)) {
          skippedCount++;
          continue;
        }

        // Mettre à jour chaque additif avec le nom et niveau de risque correct
        let hasChanges = false;
        const updatedAdditives = nutritionScore.additives.map((additive: any) => {
          const additiveInfo = getAdditiveInfo(additive.id);

          // Vérifier si des changements sont nécessaires
          if (
            additive.name !== additiveInfo.name ||
            additive.riskLevel !== additiveInfo.riskLevel
          ) {
            hasChanges = true;
            console.log(
              `  ✏️  ${product.name}: ${additive.id} "${additive.name || "no name"}" → "${additiveInfo.name}" (${additiveInfo.riskLevel})`
            );
          }

          return {
            id: additiveInfo.code,
            name: additiveInfo.name,
            riskLevel: additiveInfo.riskLevel
          };
        });

        // Mettre à jour seulement si nécessaire
        if (hasChanges) {
          await prisma.product.update({
            where: { id: product.id },
            data: {
              nutrition_score: {
                ...nutritionScore,
                additives: updatedAdditives
              }
            }
          });
          updatedCount++;
        } else {
          skippedCount++;
        }
      } catch (error) {
        console.error(`❌ Error processing product ${product.id}:`, error);
        errorCount++;
      }
    }

    console.log("\n✅ Migration completed!");
    console.log(`   Updated: ${updatedCount} products`);
    console.log(`   Skipped: ${skippedCount} products (no changes needed)`);
    console.log(`   Errors: ${errorCount} products`);
  } catch (error) {
    console.error("❌ Migration failed:", error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

// Exécuter la migration
migrateAdditives();
