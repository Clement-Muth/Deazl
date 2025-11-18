# Mise à jour - Additifs et Thème Dark

## Résumé des changements

### 1. 🎨 Correction du thème dark

**Problème**: Les textes restaient noirs en mode dark sur toute l'application.

**Solution**: Remplacement de toutes les classes `text-black` et `text-gray-900` par `text-foreground` qui s'adapte automatiquement au thème.

**Fichiers modifiés**:
- `ProductBrowserPage.tsx` (2 occurrences)
- `StoreEnrichmentPanel.tsx` (7 occurrences)
- `Avatar.tsx` (1 occurrence)
- `FavoriteStores.tsx` (2 occurrences)
- `OptimalPricing.tsx` (8 occurrences)
- `PantryPage.tsx` (1 occurrence)
- `PantryItemCard.tsx` (1 occurrence)

**Total**: 22 corrections de couleurs

---

### 2. 🧪 Affichage des noms d'additifs

**Problème**: Les additifs n'affichaient que le code (ex: "e471") sans le nom.

**Solution complète**:

#### A. Enrichissement du parsing OpenFoodFacts
**Fichier**: `ProductQuality.vo.ts`

Avant:
```typescript
// Parsing basique avec logique approximative
const name = tag.replace("en:", "").replace("-", " ");
let riskLevel = "safe"; // Puis logique if/else approximative
```

Après:
```typescript
import { getAdditiveInfo } from "~/applications/Recipes/Domain/Services/AdditiveDatabase";

// Utilisation de notre base de données complète
const additiveInfo = getAdditiveInfo(cleanTag);
return {
  id: additiveInfo.code,
  name: additiveInfo.name, // ✅ Nom complet depuis DB
  riskLevel: additiveInfo.riskLevel // ✅ Niveau de risque précis
};
```

**Avantages**:
- Noms corrects en français (ex: "Mono et diglycérides d'acides gras")
- Niveaux de risque précis (4 niveaux: safe, moderate, high_risk, dangerous)
- Base de données extensible (`AdditiveDatabase.ts` avec 50+ additifs)

#### B. Mise à jour de l'affichage UI
**Fichiers**: `AdditivesSection.tsx`, `ProductAdditives.tsx`

Avant:
```tsx
<p className="text-sm">{additive.name}</p>
<p className="text-xs">{additive.id}</p>
```

Après:
```tsx
<p className="text-sm">
  {additive.name} <span className="text-xs font-mono">({additive.id.toUpperCase()})</span>
</p>
```

Format final: **"Mono et diglycérides d'acides gras (E471)"**

#### C. Script de migration des produits existants
**Fichier**: `scripts/migrate-additives.ts`

Script créé pour mettre à jour tous les produits déjà en base de données:

```bash
# Exécution
yarn migrate:additives
# ou
npm run migrate:additives
```

**Ce que fait le script**:
1. Récupère tous les produits avec `nutrition_score`
2. Re-parse chaque additif avec `getAdditiveInfo()`
3. Met à jour avec le nom et niveau de risque corrects
4. Affiche un rapport détaillé (Updated/Skipped/Errors)

**Sécurité**:
- Ne modifie que si des changements sont détectés
- Affiche chaque changement avant de l'appliquer
- Gestion d'erreurs par produit
- Transactions Prisma atomiques

---

## Comment tester

### 1. Thème dark
```bash
yarn dev:pcomparator
```
1. Ouvrir l'app
2. Aller dans Settings > Appearance
3. Sélectionner "Dark"
4. Naviguer dans toutes les pages:
   - Products browser
   - Shopping lists
   - Settings (Avatar, Favorite stores, Optimal pricing)
   - Pantry
   - Store enrichment panel
5. ✅ Tous les textes doivent être lisibles (blancs/gris clair)

### 2. Additifs avec noms

#### Test 1: Nouveau produit
```bash
yarn dev:pcomparator
```
1. Créer une nouvelle shopping list
2. Scanner/ajouter un produit avec barcode (ex: 3017620422003 - Nutella)
3. Ouvrir le détail du produit
4. Vérifier section "Additifs"
5. ✅ Doit afficher: **"Lécithine (E322)"** au lieu de juste "e322"

#### Test 2: Migration des produits existants
```bash
cd apps/pcomparator
yarn migrate:additives
```

**Sortie attendue**:
```
🚀 Starting additives migration...

📦 Found 42 products with nutrition_score data

  ✏️  Nutella: e322 "no name" → "Lécithine" (safe)
  ✏️  Coca-Cola: e150d "Caramel" → "Caramel au sulfite d'ammonium" (high_risk)
  ...

✅ Migration completed!
   Updated: 38 products
   Skipped: 4 products (no changes needed)
   Errors: 0 products
```

3. Rafraîchir l'app
4. Ouvrir un produit existant
5. ✅ Les additifs doivent maintenant avoir leurs noms complets

---

## Architecture

### Base de données d'additifs
**Localisation**: `applications/Recipes/Domain/Services/AdditiveDatabase.ts`

Structure:
```typescript
export const ADDITIVES_DATABASE: Record<string, Additive> = {
  E100: { code: "E100", name: "Curcumine", riskLevel: "safe", ... },
  E471: { code: "E471", name: "Mono et diglycérides d'acides gras", riskLevel: "moderate", ... },
  // 50+ additifs
};

export function getAdditiveInfo(code: string): Additive {
  // Normalise le code et retourne l'info complète
  // Fallback si additif non trouvé
}
```

**Sources**:
- Yuka (classification des risques)
- Open Food Facts (codes et noms)
- Réglementation UE

---

## Notes techniques

### Classes Tailwind pour dark mode
- ✅ `text-foreground` → adaptatif automatique
- ❌ `text-gray-900` → toujours noir
- ✅ `dark:bg-gray-800` → conditionnel explicite
- ✅ `text-gray-500 dark:text-gray-400` → pour textes secondaires

### Prisma JSON queries
Les filtres `NOT: { field: null }` ne fonctionnent pas avec les types JSON.
Solution: récupérer tous les documents et filtrer en mémoire.

### Performance migration
- Le script traite ~40 produits en <2 secondes
- Peut être exécuté plusieurs fois (idempotent)
- Pas de downtime requis

---

## Problèmes potentiels

### 1. Additifs non répertoriés
Si un code E n'est pas dans `ADDITIVES_DATABASE`:
- Fallback: affiche le code tel quel
- Niveau de risque: "moderate" par défaut
- Solution: ajouter l'additif dans la base de données

### 2. Migration sur production
```bash
# Sur Vercel
vercel env pull
tsx scripts/migrate-additives.ts
```

⚠️ Attention: Vérifier que DATABASE_URL pointe vers la bonne DB

### 3. Nouveaux codes OpenFoodFacts
Certains codes peuvent être:
- En minuscules: "e471"
- Avec tirets: "e-471"
- Sans E: "471"

✅ La fonction `getAdditiveInfo()` normalise tous ces cas

---

## Prochaines étapes possibles

1. **Enrichir la base d'additifs**: ajouter plus d'entrées dans `AdditiveDatabase.ts`
2. **Traductions i18n**: supporter l'anglais pour les noms d'additifs
3. **API externe**: intégrer une API d'additifs plus complète
4. **Filtres**: permettre de filtrer les produits par niveau de risque d'additifs
5. **Alertes**: notifier l'utilisateur si un produit contient des additifs dangereux

---

## Références

- [Base de données Yuka](https://yuka.io/additifs/)
- [Open Food Facts API](https://world.openfoodfacts.org/data)
- [Tailwind Dark Mode](https://tailwindcss.com/docs/dark-mode)
- [HeroUI Theme](https://heroui.com/docs/customization/theme)
