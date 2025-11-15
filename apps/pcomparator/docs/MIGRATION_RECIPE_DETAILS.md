# Migration RecipeDetails → RecipeDetailsMobile

## 📋 Résumé

Migration complète de l'ancien système RecipeDetails vers le nouveau système RecipeDetailsMobile avec intégration des vraies données de la base de données.

**Date** : 15 novembre 2025  
**Branch** : `feat/implement-recipe-price-and-score-calcul`

---

## 🗑️ Fichiers Supprimés

### 1. **RecipeDetails.tsx** (ancien)
- Composant desktop/tablet-first
- Sections séparées pour pricing et quality
- Layout complexe avec grille

### 2. **RecipePricingSection.tsx**
- Section séparée pour afficher les prix
- Overkill avec accordions et alternatives
- Pas pratique pour cuisiner

### 3. **RecipeIngredientsWithPricing.tsx**
- Liste d'ingrédients avec prix intégrés (première version)
- Remplacé par l'intégration dans RecipeDetailsMobile

---

## ✨ Nouveaux Fichiers

### 1. **RecipeDetailsMobile.tsx** (805 lignes)
**Emplacement** : `/Ui/RecipeDetailsMobile.tsx`

**Fonctionnalités** :
- ✅ Design mobile-first complet
- ✅ Scroll vertical unique
- ✅ Header fixe avec actions rapides
- ✅ Ingrédients avec prix, labels, allergènes intégrés
- ✅ Mode step-by-step pour la préparation
- ✅ Qualité nutritionnelle avec conseils actionnables
- ✅ Sections collapsibles
- ✅ Vraies données de la DB (plus de mock)

**Hook utilisé** : `useRecipeData` pour charger pricing + quality

### 2. **RecipeDetailsContainer.tsx**
**Emplacement** : `/Ui/RecipeDetailsContainer.tsx`

**Rôle** : Container qui gère :
- Modals (Share, AddToList)
- Navigation
- Product detail modal
- Passe les callbacks à RecipeDetailsMobile

### 3. **useRecipeData.ts**
**Emplacement** : `/Ui/hooks/useRecipeData.ts`

**Rôle** : Hook personnalisé qui charge en parallèle :
```typescript
const [pricingResult, qualityResult] = await Promise.all([
  getRecipePricing(recipeId, userId),
  getRecipeQuality(recipeId)
]);
```

---

## 🔄 Modifications

### 1. **index.ts**
```diff
- export { default as RecipeDetails } from "./RecipeDetails";
+ export { RecipeDetailsContainer as RecipeDetails } from "./RecipeDetailsContainer";
```

### 2. **app/[locale]/recipes/[id]/page.tsx**
```diff
- import { RecipeDetails } from "~/applications/Recipes/Ui";
+ import { RecipeDetailsContainer } from "~/applications/Recipes/Ui/RecipeDetailsContainer";

- <div className="flex flex-col gap-y-8 max-w-4xl w-full">
-   <div className="max-w-7xl mx-auto w-full pb-8">
-     <RecipeDetails recipe={recipe} userId={session?.user?.id} />
-   </div>
- </div>
+ <RecipeDetailsContainer recipe={recipe} userId={session?.user?.id} />
```

### 3. **app/[locale]/recipes/shared/[token]/page.tsx**
```diff
- import RecipeDetails from "~/applications/Recipes/Ui/RecipeDetails";
+ import { RecipeDetailsContainer } from "~/applications/Recipes/Ui/RecipeDetailsContainer";

- <div className="container mx-auto p-4 sm:p-6 max-w-5xl">
-   <RecipeDetails recipe={recipe} />
- </div>
+ <RecipeDetailsContainer recipe={recipe} />
```

---

## 📊 Mapping des Vraies Données

### Pricing (RecipePricingResult)

```typescript
const totalCost = pricing?.totals.optimizedMix || 0;
const costPerServing = totalCost / recipe.servings;
const ingredientsWithoutPrice = pricing?.missingCount || 0;

// Par ingrédient
const priceData = pricing?.breakdown.find((b) => b.ingredientId === ing.id);
const price = priceData?.selected?.price;
const store = priceData?.selected?.storeName;
const distance = priceData?.selected?.distanceKm;
```

### Quality (RecipeQualityResult)

```typescript
const qualityScore = quality?.qualityScore || 0;
const nutriScore = quality?.averageNutriScore || "?";
const ecoScore = quality?.averageEcoScore || "?";
const novaGroup = quality?.avgNovaGroup || 0;
const additivesCount = quality?.additivesCount || 0;
const allergensCount = quality?.allergensCount || 0;

// Par ingrédient
const qualityData = quality?.details.find((d) => d.ingredientId === ing.id);
const nutriScore = qualityData?.nutriScore;
const ecoScore = qualityData?.ecoScore;
const novaGroup = qualityData?.novaGroup;

// Recommendations
const recommendations = quality?.recommendations || [];
```

### Labels Extraction

```typescript
const labels: Array<"bio" | "eco" | "ultra-processed"> = [];

// Ultra-transformé depuis Nova Group
if (qualityData?.novaGroup && qualityData.novaGroup === 4) {
  labels.push("ultra-processed");
}

// Éco depuis EcoScore
if (qualityData?.ecoScore && (qualityData.ecoScore === "A" || qualityData.ecoScore === "B")) {
  labels.push("eco");
}

// Bio : À implémenter depuis product.isBio (futur)
```

---

## 🎨 Design Changes

### Ancien (RecipeDetails.tsx)
- Layout desktop-first avec grille 2 colonnes
- Section pricing séparée avec accordion
- Liste ingrédients simple sans prix
- Quality dans une card séparée

### Nouveau (RecipeDetailsMobile.tsx)
- **Mobile-first** : Scroll vertical unique
- **Header fixe** : Actions rapides (❤️ 🔗 🛒)
- **Ingrédients enrichis** : Prix + Labels + Allergènes intégrés
- **Step-by-step** : Mode cuisine avec progression
- **Quality inline** : Conseils actionnables avec vraies recommendations
- **Collapsible** : Détails nutrition, astuces, conservation

---

## 🚀 Features Ajoutées

### 1. Mode Step-by-Step
```typescript
const [stepByStepMode, setStepByStepMode] = useState(false);
const [currentStep, setCurrentStep] = useState(0);
const [stepsCompleted, setStepsCompleted] = useState<StepProgress>({});
```

**UI** :
- Barre de progression
- Navigation ← Précédent | ✓ Marquer terminé | Suivant →
- Compteur : "Étape X/Total" + "X/Total terminées"

### 2. Filtrage Ingrédients sans Prix
```typescript
const [hideNoPriceIngredients, setHideNoPriceIngredients] = useState(false);
const visibleIngredients = hideNoPriceIngredients
  ? ingredientsWithPrice.filter((ing) => ing.price)
  : ingredientsWithPrice;
```

### 3. Favoris (Local)
```typescript
const [isFavorite, setIsFavorite] = useState(false);
```
**TODO** : Persister dans DB

### 4. Vraies Recommendations
```typescript
{quality?.recommendations.slice(0, 3).map((rec) => (
  <div className={borderColor}>
    <Icon /> {rec.suggestion}
    <Trans>Amélioration de +{rec.expectedQualityGain} points</Trans>
  </div>
))}
```

---

## 🐛 Points d'Attention

### 1. **Allergènes par Ingrédient**
Actuellement, les allergènes sont agrégés globalement dans `RecipeQualityResult.allergensCount`, mais pas par ingrédient dans `QualityBreakdownItem`.

**Solution actuelle** : Afficher `allergensCount` global dans la section quality.

**TODO** : Ajouter `allergens: string[]` dans `QualityBreakdownItem` si besoin de détail par ingrédient.

### 2. **Label "Bio"**
Pas encore détecté depuis les données produit.

**TODO** : Ajouter champ `isBio` dans le modèle Product et l'utiliser pour générer le label.

### 3. **Performance**
`useRecipeData` fait 2 appels API parallèles à chaque chargement.

**Optimisation future** : 
- Cache avec SWR ou React Query
- Server-side data fetching dans la page

### 4. **State Persistence**
État step-by-step perdu au refresh.

**Optimisation future** :
- localStorage pour persister progression
- URL param `?step=3`

---

## ✅ Checklist Migration

- ✅ RecipeDetailsMobile créé avec vraies données
- ✅ RecipeDetailsContainer créé
- ✅ useRecipeData hook créé
- ✅ Ancien RecipeDetails.tsx supprimé
- ✅ RecipePricingSection.tsx supprimé
- ✅ RecipeIngredientsWithPricing.tsx supprimé
- ✅ index.ts mis à jour
- ✅ page.tsx mis à jour
- ✅ shared/[token]/page.tsx mis à jour
- ✅ Mapping pricing données réelles
- ✅ Mapping quality données réelles
- ✅ Extraction labels (eco, ultra-processed)
- ✅ Vraies recommendations affichées
- ✅ Loading state ajouté
- ✅ Error handling ajouté
- ✅ Documentation complète

---

## 📚 Documentation

- **Architecture** : `/docs/RECIPE_PRICING_QUALITY_README.md`
- **Composant Mobile** : `/docs/RECIPE_DETAILS_MOBILE_README.md`
- **Migration** : Ce fichier

---

## 🔮 Prochaines Étapes

1. **Détection Bio** : Ajouter `isBio` dans Product model
2. **Allergènes par ingrédient** : Étendre `QualityBreakdownItem`
3. **Persistance favoris** : API + DB
4. **Cache données** : SWR ou React Query
5. **Photos/vidéos étapes** : Upload + display
6. **Variantes recette** : Végétarien, sans gluten, etc.
7. **Notes utilisateurs** : Rating system

---

## 📞 Support

**Questions** : Voir les README dans `/docs/`  
**Bugs** : Vérifier console errors et API responses  
**Features** : Voir checklist ci-dessus
