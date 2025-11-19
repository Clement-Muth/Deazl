# Migration Guide - Ancien Système → Nouveau Système de Visibilité

## Vue d'ensemble

Ce guide explique comment migrer les recettes existantes vers le nouveau système de visibilité.

## État Actuel

Le schema Prisma actuel utilise :
```prisma
model Recipe {
  isPublic    Boolean  @default(true)
  shareToken  String?  @unique
  // ...
}
```

## Nouveau Mapping

### Logique de Conversion

```typescript
if (isPublic === true) {
  → RecipeVisibilityStatus.PUBLIC
  → Visible dans hub, indexé SEO
}

if (isPublic === false && shareToken !== null) {
  → RecipeVisibilityStatus.UNLISTED
  → Accessible via token uniquement
}

if (isPublic === false && shareToken === null) {
  → RecipeVisibilityStatus.PRIVATE
  → Visible uniquement par propriétaire/collaborateurs
}
```

## Migration SQL (Optionnelle)

Si vous souhaitez normaliser les données existantes :

```sql
-- Compter les recettes par type
SELECT 
  CASE 
    WHEN "isPublic" = true THEN 'PUBLIC'
    WHEN "isPublic" = false AND "shareToken" IS NOT NULL THEN 'UNLISTED'
    WHEN "isPublic" = false AND "shareToken" IS NULL THEN 'PRIVATE'
  END as visibility_type,
  COUNT(*) as count
FROM "Recipe"
GROUP BY visibility_type;

-- Vérifier les recettes problématiques (publiques avec token)
SELECT id, name, "isPublic", "shareToken"
FROM "Recipe"
WHERE "isPublic" = true AND "shareToken" IS NOT NULL;

-- Optionnel : Nettoyer tokens sur recettes publiques
UPDATE "Recipe"
SET "shareToken" = NULL
WHERE "isPublic" = true AND "shareToken" IS NOT NULL;
```

## Migration Automatique (Recommandé)

Le système gère automatiquement la conversion via `RecipeVisibility.fromBooleans()`.

**Aucune action manuelle requise !**

## Script de Vérification

Créez un script pour auditer vos données :

```typescript
// scripts/audit-recipe-visibility.ts
import { prisma } from "@deazl/system";

async function auditRecipeVisibility() {
  const recipes = await prisma.recipe.findMany({
    select: {
      id: true,
      name: true,
      isPublic: true,
      shareToken: true,
    },
  });

  const stats = {
    public: 0,
    unlisted: 0,
    private: 0,
    total: recipes.length,
  };

  for (const recipe of recipes) {
    if (recipe.isPublic) {
      stats.public++;
    } else if (recipe.shareToken) {
      stats.unlisted++;
    } else {
      stats.private++;
    }
  }

  console.log("📊 Recipe Visibility Audit:");
  console.log(`Total: ${stats.total}`);
  console.log(`PUBLIC: ${stats.public} (${((stats.public / stats.total) * 100).toFixed(1)}%)`);
  console.log(`UNLISTED: ${stats.unlisted} (${((stats.unlisted / stats.total) * 100).toFixed(1)}%)`);
  console.log(`PRIVATE: ${stats.private} (${((stats.private / stats.total) * 100).toFixed(1)}%)`);

  return stats;
}

auditRecipeVisibility().then(() => process.exit(0));
```

Exécutez :
```bash
npx tsx scripts/audit-recipe-visibility.ts
```

## Mise à Jour des Recettes Existantes

### Exemple 1 : Rendre une recette publique

```typescript
import { PrismaRecipeRepository } from "~/applications/Recipes/Infrastructure/Repositories/PrismaRecipe.infrastructure";
import { RecipeVisibilityStatus } from "~/applications/Recipes/Domain/ValueObjects/RecipeVisibility.vo";

const repo = new PrismaRecipeRepository();
const recipe = await repo.findById("recipe-id");

if (recipe) {
  const publicRecipe = recipe.withVisibility(RecipeVisibilityStatus.PUBLIC);
  await repo.save(publicRecipe);
}
```

### Exemple 2 : Créer un lien de partage

```typescript
const recipe = await repo.findById("recipe-id");

if (recipe) {
  const unlistedRecipe = recipe.withVisibility(RecipeVisibilityStatus.UNLISTED);
  await repo.save(unlistedRecipe);
  
  console.log(`Lien de partage : /recipes/${recipe.id}?share=${unlistedRecipe.shareToken}`);
}
```

### Exemple 3 : Rendre privée

```typescript
const recipe = await repo.findById("recipe-id");

if (recipe) {
  const privateRecipe = recipe.withVisibility(RecipeVisibilityStatus.PRIVATE);
  await repo.save(privateRecipe);
}
```

## Données de Test

### Créer des Recettes Publiques

```typescript
import { Recipe } from "~/applications/Recipes/Domain/Entities/Recipe.entity";
import { RecipeVisibilityStatus } from "~/applications/Recipes/Domain/ValueObjects/RecipeVisibility.vo";

// Directement avec isPublic
const publicRecipe = Recipe.create({
  name: "Pâtes Carbonara",
  description: "Recette traditionnelle italienne",
  difficulty: "EASY",
  preparationTime: 10,
  cookingTime: 15,
  servings: 4,
  userId: "user-id",
  isPublic: true,  // ← PUBLIC
  ingredients: [],
  steps: [],
});

await repo.save(publicRecipe);
```

### Créer des Recettes Privées

```typescript
const privateRecipe = Recipe.create({
  name: "Ma recette secrète",
  // ...
  isPublic: false,  // ← PRIVATE
  shareToken: null,
});
```

### Créer des Recettes Partagées

```typescript
const recipe = Recipe.create({
  name: "Recette familiale",
  // ...
  isPublic: false,
});

// Générer token
const sharedRecipe = recipe.generateShareToken();
await repo.save(sharedRecipe);
```

## Impact sur les API Existantes

### APIs Inchangées

✅ `getRecipe(id)` - Toujours fonctionnel
✅ `createRecipe()` - Compatible
✅ `updateRecipe()` - Compatible
✅ `deleteRecipe()` - Compatible

### Nouvelles APIs

✨ `getRecipeWithAccess()` - Recommandé pour accès
✨ `getPublicHubData()` - Hub public
✨ `checkRecipeAccess()` - Vérification

### APIs Dépréciées

⚠️ Utilisez les nouvelles pour bénéficier du contrôle d'accès

## Vérification Post-Migration

### Checklist

- [ ] Toutes les recettes publiques sont visibles dans hub public
- [ ] Les recettes privées ne sont pas visibles aux visiteurs
- [ ] Les liens de partage fonctionnent
- [ ] Les prix s'affichent correctement (public vs user)
- [ ] Les CTAs de connexion s'affichent pour non-connectés
- [ ] Les actions sont désactivées pour non-connectés

### Tests Manuels

1. **Déconnecté :**
   - Hub public affiche uniquement recettes publiques
   - Accès recette privée → bloqué
   - Lien partagé → fonctionne

2. **Connecté :**
   - Hub enrichi
   - Recettes privées accessibles
   - Actions disponibles

## Rollback

En cas de problème, revenez aux anciennes pages :

```typescript
// app/[locale]/recipes/page.tsx
import { getRecipeHubData } from "~/applications/Recipes/Api";
import { RecipeHubContent } from "~/applications/Recipes/Ui/RecipeHubContent";

async function RecipesPage() {
  const hubData = await getRecipeHubData();
  return <RecipeHubContent hubData={hubData} />;
}
```

## Support

Questions ? Consultez :
- `/docs/RECIPE_VISIBILITY_SYSTEM.md` - Documentation complète
- `/docs/RECIPE_VISIBILITY_QUICKSTART.md` - Guide démarrage

---

**Migration sans downtime garantie !** ✅
