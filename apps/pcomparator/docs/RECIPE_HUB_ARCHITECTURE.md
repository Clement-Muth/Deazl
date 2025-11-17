# Recipe Hub - Architecture Complète

## 📋 Vue d'ensemble

Le Recipe Hub est un module complet pour Deazl qui permet de découvrir, rechercher et optimiser des recettes en fonction du budget, de la qualité nutritionnelle, du cellier personnel, et des habitudes d'achat.

### 🎯 Objectifs clés

- **Prix dynamiques** : Calcul en temps réel basé sur les prix réels des magasins
- **Qualité nutritionnelle** : Score basé sur OpenFoodFacts
- **Optimisation cellier** : Suggestions basées sur les ingrédients disponibles
- **Recommandations personnalisées** : ML-based sur les préférences et achats
- **Recherche intelligente** : Filtres avancés (régimes, temps, difficulté)

---

## 🗄️ Architecture Prisma

### Nouveaux modèles ajoutés

```prisma
model RecipeCategory {
  id          String   @id @default(uuid()) @db.Uuid
  name        String
  slug        String   @unique
  description String?
  icon        String?
  parentId    String?  @db.Uuid
  order       Int      @default(0)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  parent   RecipeCategory?  @relation("CategoryHierarchy", fields: [parentId], references: [id])
  children RecipeCategory[] @relation("CategoryHierarchy")

  @@index([slug])
  @@index([parentId])
}

model RecipeTag {
  id        String   @id @default(uuid()) @db.Uuid
  name      String   @unique
  slug      String   @unique
  color     String?
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@index([slug])
}

model RecipeTrending {
  id         String   @id @default(uuid()) @db.Uuid
  recipeId   String   @unique @db.Uuid
  score      Float    @default(0)
  viewsLast7Days      Int      @default(0)
  favoritesLast7Days  Int      @default(0)
  createdAt  DateTime @default(now())
  updatedAt  DateTime @updatedAt

  recipe Recipe @relation(fields: [recipeId], references: [id], onDelete: Cascade)

  @@index([score])
  @@index([updatedAt])
}
```

### Modifications au modèle Recipe

- Ajout de `trending: RecipeTrending?`
- Ajout d'index sur `[isPublic]`, `[category]`, `[cuisine]`, `[difficulty]`, `[createdAt]`, `[viewsCount]`, `[favoritesCount]`

---

## 🏗️ Structure des Services (Application Layer)

### 1. RecipeHubService
**Rôle** : Orchestre tous les services pour générer les données du Hub

```typescript
class RecipeHubService {
  getHubData(userId?: string): Promise<RecipeHubData>
  getPopularCategories(): Promise<RecipeCategoryData[]>
}
```

**Sections retournées** :
- Popular (tri par viewsCount)
- Quick (maxPreparationTime ≤ 30 min)
- Cheap (prix par portion optimal)
- Healthy (score qualité ≥ 70)
- Cellar-Based (faisabilité ≥ 50%)
- Recommended (ML basé sur favoris/historique)
- Purchase-Based (ingrédients des achats récents)
- New (tri par createdAt desc)
- Categories (5 catégories principales)

---

### 2. RecipeSearchService
**Rôle** : Recherche et filtrage intelligents

```typescript
interface RecipeSearchFilters {
  searchTerm?: string;
  category?: string;
  cuisine?: string;
  tags?: string[];
  difficulty?: DifficultyLevel;
  maxPreparationTime?: number;
  maxCookingTime?: number;
  maxTotalTime?: number;
  minServings?: number;
  maxServings?: number;
  isVegan?: boolean;
  isVegetarian?: boolean;
  isGlutenFree?: boolean;
  isDairyFree?: boolean;
  sortBy?: "newest" | "popular" | "favorites" | "quickest" | "cheapest" | "healthiest";
  limit?: number;
  offset?: number;
}
```

**Méthodes** :
- `searchRecipes(filters)` : Recherche avec tous les filtres
- `getPopularRecipes(limit)` : Top recettes par vues
- `getQuickRecipes(maxMinutes, limit)` : Recettes rapides
- `getHealthyRecipes(limit)` : Recettes avec tags healthy
- `getNewRecipes(limit)` : Dernières recettes
- `getRecipesByCategory(category, limit)` : Filtrage par catégorie

---

### 3. RecipePricingService
**Rôle** : Calcul dynamique des prix basé sur les données réelles

```typescript
interface RecipePricingResult {
  recipeId: string;
  recipeName: string;
  totalPrice: number;
  pricePerServing: number;
  currency: string;
  storeId?: string;
  storeName?: string;
  ingredients: Array<{
    name: string;
    quantity: number;
    unit: string;
    price: number;
    productId?: string;
    hasPrice: boolean;
  }>;
  missingPrices: number;
  priceQuality: "excellent" | "good" | "average" | "poor";
}
```

**Méthodes** :
- `calculateRecipePrice(recipeId, storeId?, userLocation?)` : Prix total pour un magasin
- `getCheapRecipes(limit, maxPricePerServing?)` : Top recettes économiques
- `compareStoresForRecipe(recipeId, userLocation?)` : Comparaison multi-magasins

**Logique** :
- Prix par ingrédient basé sur le dernier `Price` enregistré
- Calcul par portion : `totalPrice / servings`
- Score de qualité selon % de prix manquants
- Support des alternatives (produits similaires)

---

### 4. RecipeQualityService
**Rôle** : Évaluation de la qualité nutritionnelle

```typescript
interface RecipeQualityScore {
  recipeId: string;
  recipeName: string;
  overallScore: number;
  nutritionScore?: number;
  ingredientQualityScore: number;
  diversityScore: number;
  healthBadges: string[];
  warnings: string[];
  details: {
    hasAdditives: boolean;
    hasUltraProcessed: boolean;
    isOrganic: boolean;
    caloriesPerServing?: number;
    proteinPerServing?: number;
    carbsPerServing?: number;
    fatPerServing?: number;
  };
}
```

**Méthodes** :
- `calculateRecipeQuality(recipeId)` : Score complet
- `getHealthyRecipes(limit, minQualityScore)` : Top recettes saines

**Calcul du score** :
- Nutrition grade (A=100, B=80, C=60, D=40, E=20)
- Diversity score (unicité des catégories d'ingrédients)
- Overall = `(nutrition * 0.6 + diversity * 0.4) * (hasUltraProcessed ? 0.8 : 1)`
- Health badges : Vegan, Vegetarian, Gluten-Free, Organic, No Additives

---

### 5. RecipeCellarService
**Rôle** : Faisabilité basée sur le cellier (PantryItems)

**Méthodes** :
- `getRecipesFeasibleWithCellar(userId, limit)` : Recettes réalisables
- `checkRecipeFeasibility(recipeId, userId)` : Détail ingrédient par ingrédient
- `suggestRecipesBasedOnExpiringItems(userId, daysThreshold, limit)` : Anti-gaspillage

**Faisabilité** :
- Score = `(availableIngredients / totalIngredients) * 100`
- Seuil minimum : 50%
- Tri par score décroissant

---

### 6. RecipeRecommendationService
**Rôle** : Recommandations ML-based personnalisées

**Méthodes** :
- `getRecommendedRecipes(userId, limit)` : Basé sur favoris + historique
- `getRecipesBasedOnPurchases(userId, limit)` : Basé sur achats récents

**Algorithme** :
1. Extraction des préférences (catégories, cuisines, tags) depuis favoris
2. Analyse des achats récents (ingrédients fréquents)
3. Scoring pondéré :
   - Catégorie match : +3
   - Cuisine match : +2
   - Tags match : +1
4. Tri par score + viewsCount

---

## 🌐 API Layer (Server Actions)

### Structure des API

```
Api/
├── hub/
│   └── getRecipeHubData.api.ts          # Hub principal
├── search/
│   └── searchRecipes.api.ts             # Recherche + filtres
├── pricing/
│   └── recipePricing.api.ts             # Prix dynamiques
├── cellar/
│   └── recipeCellar.api.ts              # Faisabilité cellier
├── recommendations/
│   └── recipeRecommendations.api.ts     # Recommandations
└── index.ts                              # Exports centralisés
```

### APIs principales

#### Hub Data
```typescript
getRecipeHubData(): Promise<RecipeHubDataPayload>
```

#### Search & Filters
```typescript
searchRecipes(filters: RecipeSearchFilters): Promise<RecipePayload[]>
getPopularRecipes(limit): Promise<RecipePayload[]>
getQuickRecipes(maxMinutes, limit): Promise<RecipePayload[]>
getHealthyRecipes(limit): Promise<RecipePayload[]>
getNewRecipes(limit): Promise<RecipePayload[]>
getRecipesByCategory(category, limit): Promise<RecipePayload[]>
```

#### Pricing
```typescript
getCheapRecipes(limit, maxPricePerServing?): Promise<RecipePayload[]>
calculateRecipePrice(recipeId, storeId?): Promise<RecipePricingResult>
compareStoresForRecipe(recipeId): Promise<RecipePricingResult[]>
```

#### Cellar
```typescript
getRecipesFeasibleWithCellar(limit): Promise<RecipePayload[]>
checkRecipeFeasibility(recipeId): Promise<FeasibilityResult>
suggestRecipesBasedOnExpiringItems(daysThreshold, limit): Promise<RecipePayload[]>
```

#### Recommendations
```typescript
getRecommendedRecipes(limit): Promise<RecipePayload[]>
getRecipesBasedOnPurchases(limit): Promise<RecipePayload[]>
```

---

## 🎨 UI Components (Réutilisables)

### Components de base

#### RecipeCard
```typescript
interface RecipeCardProps {
  recipe: RecipePayload;
  showFavorite?: boolean;
  isFavorite?: boolean;
  onFavoriteToggle?: (recipeId: string) => void;
  isCompact?: boolean;
}
```

- Image avec fallback ChefHat
- Badge difficulté (success/warning/danger)
- Catégorie & cuisine chips
- Metadata : temps, servings, nb ingrédients
- Mode compact pour listes horizontales

#### RecipeHorizontalList
```typescript
interface RecipeHorizontalListProps {
  recipes: RecipePayload[];
  title: string;
  icon?: ReactNode;
  onViewAll?: () => void;
  showFavorites?: boolean;
  isLoading?: boolean;
}
```

- Scroll horizontal avec flèches navigation
- Skeleton loading state
- CTA "Voir plus" optionnel
- Snap scrolling

#### RecipeSearchBar
```typescript
interface RecipeSearchBarProps {
  onSearch: (query: string) => void;
  onFilterClick?: () => void;
  placeholder?: string;
  showFilters?: boolean;
}
```

- Input avec icône Search
- Bouton clear (X)
- Bouton filtres avancés (SlidersHorizontal)
- Support Enter key

#### RecipeSearchFiltersModal
```typescript
interface RecipeSearchFiltersModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApplyFilters: (filters: RecipeSearchFilters) => void;
  initialFilters?: RecipeSearchFilters;
}
```

- Select : Catégorie, Cuisine, Difficulté
- Sliders : Temps préparation, Temps cuisson
- Checkboxes : Vegan, Vegetarian, Gluten-Free, Dairy-Free
- Select : Sort by (Popular, Newest, Favorites, Quickest)
- Boutons : Réinitialiser, Appliquer

#### RecipeCategoryCard
```typescript
interface RecipeCategoryCardProps {
  name: string;
  slug: string;
  count: number;
  icon?: ReactNode;
  imageUrl?: string;
}
```

- Gradient overlay
- Icon/image background
- Count display
- Pressable → redirect vers `/recipes/explore?category=slug`

#### RecipeTagBadge
```typescript
interface RecipeTagBadgeProps {
  children: ReactNode;
  variant?: "flat" | "solid" | "bordered" | "light" | "faded" | "shadow";
  color?: "default" | "primary" | "secondary" | "success" | "warning" | "danger";
  size?: "sm" | "md" | "lg";
  icon?: ReactNode;
}
```

- Wrapper HeroUI Chip
- Support icônes
- Variantes couleurs

---

## 📄 Pages

### 1. Recipe Hub (`/recipes`)

**Fichier** : `src/app/[locale]/recipes/page.tsx`

**Contenu** :
- Hero search section
- Quick filters pills (Vegan, Végétarien, Sans gluten, Rapide)
- Section "Recettes Populaires"
- Section "Recettes Rapides"
- Section "Recettes Économiques"
- Section "Recettes Saines"
- Section "Faisable avec votre cellier" (si userId)
- Section "Recommandé pour vous" (si userId)
- Section "Basé sur vos achats récents" (si userId)
- Section "Explorer par catégorie" (grid)
- Section "Nouvelles Recettes"

**Data loading** :
```typescript
const hubData = await getRecipeHubData();
return <RecipeHubContent hubData={hubData} />;
```

---

### 2. Recipe Search/Explore (`/recipes/explore`)

**Fichier** : `src/app/[locale]/recipes/explore/page.tsx`

**Contenu** :
- Bouton retour vers hub
- Search bar + filtres
- Affichage filtres actifs (pills)
- Grille de résultats (grid 4 colonnes)
- Modal filtres avancés
- Empty state avec suggestions

**URL Query Params** :
- `?q=` : Search term
- `?category=` : Category slug
- `?cuisine=` : Cuisine
- `?difficulty=` : EASY/MEDIUM/HARD
- `?maxTime=` : Max total time
- `?tags=` : Tags (vegan, vegetarian, gluten-free, etc.)
- `?sort=` : Sort by (popular/newest/favorites/quickest)

**State management** :
- Client-side search avec debounce
- URL synchronization
- Filter persistence

---

## 🔄 Flux de données

### Exemple : Recherche avec filtres

```
User action → RecipeSearchPage
  ↓
handleSearch(query) / handleApplyFilters(filters)
  ↓
searchRecipes(filters) [Server Action]
  ↓
RecipeSearchService.searchRecipes(filters)
  ↓
Prisma query with WHERE + ORDER BY
  ↓
Recipes mapped to JSON
  ↓
State update + Grid rendering
```

### Exemple : Prix dynamique

```
User opens recipe detail
  ↓
calculateRecipePrice(recipeId) [Server Action]
  ↓
RecipePricingService.calculateRecipePrice()
  ↓
Prisma query: Recipe + Ingredients + Products + Prices
  ↓
For each ingredient:
  - Find latest Price by store
  - Calculate ingredient_price = price * quantity
  - Sum total
  ↓
Return: { totalPrice, pricePerServing, ingredients[], priceQuality }
```

### Exemple : Recommandations

```
User visits hub (authenticated)
  ↓
getRecipeHubData() [Server Action]
  ↓
RecipeHubService.getHubData(userId)
  ↓
Parallel calls:
  - RecipeRecommendationService.getRecommendedRecipes(userId)
    → Fetch user favorites (categories, cuisines, tags)
    → Fetch user recipes (preferences)
    → Fetch recent purchases
    → Extract top categories/cuisines/tags
    → Query recipes matching preferences
    → Score and sort
  ↓
Return recommendations in hubData.recommended[]
```

---

## 🚀 Prochaines étapes

### Phase 1 (Complétée) ✅
- [x] Schéma Prisma étendu
- [x] Services Application Layer
- [x] Server Actions API
- [x] UI Components
- [x] Recipe Hub page
- [x] Search/Explore page

### Phase 2 (À faire)
- [ ] Système de cache (Redis) pour prix/scores
- [ ] Background jobs pour RecipeTrending.score
- [ ] Tests unitaires services
- [ ] Tests e2e pages principales
- [ ] Optimisations performances (lazy loading, virtual scrolling)
- [ ] A/B testing recommandations
- [ ] Export recipes en PDF
- [ ] Partage social (OpenGraph)

### Phase 3 (Future)
- [ ] Recipe Builder AI (génération automatique)
- [ ] Nutrition calculator avancé
- [ ] Meal planning hebdomadaire
- [ ] Shopping list auto-generation
- [ ] Recipe remixing (variations)
- [ ] Community features (comments, ratings)

---

## 📊 Métriques & Analytics

### KPIs à tracker
- Taux de conversion Hub → Recipe Detail
- Top sections du Hub (click-through rates)
- Filtres les plus utilisés
- Recherches sans résultats (amélioration suggestions)
- Temps moyen sur recipe detail
- Taux d'ajout favoris
- Faisabilité moyenne cellier
- Économies moyennes (prix vs marché)

### Events à logger
- `recipe_hub_viewed`
- `recipe_search_performed`
- `recipe_filter_applied`
- `recipe_viewed`
- `recipe_favorited`
- `recipe_price_calculated`
- `recipe_feasibility_checked`
- `recipe_added_to_shopping_list`

---

## 🛠️ Technologies utilisées

- **Backend** : Next.js 14 App Router, Prisma ORM, PostgreSQL
- **Frontend** : React, TypeScript, TailwindCSS, HeroUI
- **State** : React Hooks, URL state
- **Icons** : Lucide React
- **Animation** : Framer Motion
- **i18n** : Lingui

---

## 📚 Documentation de référence

- [Prisma Documentation](https://www.prisma.io/docs)
- [Next.js Server Actions](https://nextjs.org/docs/app/building-your-application/data-fetching/server-actions-and-mutations)
- [HeroUI Components](https://heroui.com)
- [OpenFoodFacts API](https://world.openfoodfacts.org/data)

---

*Architecture générée le 16/11/2025 - Deazl Recipe Hub v1.0*
