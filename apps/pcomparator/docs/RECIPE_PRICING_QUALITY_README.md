# Système de Calcul de Prix et Qualité des Recettes

## 📋 Vue d'ensemble

Ce système calcule dynamiquement le **prix** et la **qualité nutritionnelle** des recettes en fonction du contexte utilisateur et des données produits disponibles.

---

## 🏗️ Architecture

### Services Principaux

#### 1. **RecipePricingService** (Pricing Dynamique)
**Emplacement** : `/Domain/Services/RecipePricing.service.ts`

**Fonctionnalités** :
- ✅ Calcul de prix **personnalisé** (`computeForUser`) basé sur :
  - Localisation GPS de l'utilisateur
  - Distance maximale acceptée
  - Magasins favoris/exclus
  - Marques préférées
  - Pondération prix/qualité/distance configurable
- ✅ Calcul de prix **public** (`computePublic`) pour utilisateurs non connectés
- ✅ Conversion automatique d'unités (kg/g, L/ml/cl)
- ✅ Calcul de distance GPS (formule de Haversine)
- ✅ Score de confiance des prix (basé sur ancienneté et disponibilité)

**Structure de retour** :
```typescript
{
  mode: "user" | "public",
  totals: {
    optimizedMix: number,     // Prix optimal multi-magasins
    perStore: StoreTotal[]    // Total par magasin si tout acheté au même endroit
  },
  breakdown: IngredientPricingBreakdown[], // Détail par ingrédient
  missingCount: number,
  confidence: number          // 0-1
}
```

#### 2. **RecipeComputeQualityService** (Calcul de Qualité)
**Emplacement** : `/Domain/Services/RecipeComputeQuality.service.ts`

**Fonctionnalités** :
- ✅ Calcul de qualité **pondéré** par quantité d'ingrédient
- ✅ Agrégation NutriScore / EcoScore / Nova
- ✅ Comptage additifs et allergènes
- ✅ Génération de **recommandations actionnables**

**Structure de retour** :
```typescript
{
  qualityScore: number,           // 0-100
  averageNutriScore: string,      // A-E
  averageEcoScore: string,        // A-E
  avgNovaGroup: number,           // 1-4
  additivesCount: number,
  allergensCount: number,
  details: QualityBreakdownItem[],
  recommendations: QualityRecommendation[]
}
```

---

## 🧮 Logique de Calcul Détaillée

### Calcul de Qualité (RecipeComputeQualityService)

#### 1. **Pondération par Quantité**
Chaque ingrédient contribue au score global proportionnellement à sa quantité :

```typescript
weight = ingredient.quantity; // en grammes/ml
qualityScore_global = Σ(qualityScore_ingredient × weight_ingredient) / Σ(weight)
```

**Exemple** :
- Farine (500g, qualité 75/100) → poids 500
- Beurre (100g, qualité 25/100) → poids 100
- Score global = (500×75 + 100×25) / 600 = **68.75/100**

#### 2. **Traitement des Valeurs "Unknown"**

**IMPORTANT** : Les produits sans données qualité ne comptent PAS dans les moyennes.

| Champ | Si "unknown" ou absent | Impact |
|-------|------------------------|--------|
| NutriScore | Exclu du calcul (retourne 0) | Ne réduit pas la moyenne |
| EcoScore | Exclu du calcul (retourne 0) | Ne réduit pas la moyenne |
| Nova | Exclu du calcul (retourne 0) | Ne réduit pas la moyenne |
| overallQualityScore | Utilise 50/100 par défaut | Considéré comme "neutre" |

**Justification** : Si un produit n'a pas de NutriScore, c'est parce que les données manquent. Le compter comme "mauvais" (0) ou "moyen" (50) fausserait le calcul. On préfère ignorer ces produits pour calculer une moyenne **sur les données réelles disponibles**.

**Code** :
```typescript
// Retourne 0 si unknown → sera ignoré dans la moyenne
if (grade === "unknown") return 0;

// Moyenne pondérée (seuls les produits avec données comptent)
avgNutriScore = weightedNutriScoreSum / totalWeight;
```

#### 3. **Nova Score Global à 0**

**Symptôme** : Nova global affiché à `0.0` alors qu'un ingrédient a Nova=2.

**Causes possibles** :
1. **Produits sans Nova** : Si certains ingrédients n'ont pas de `novaGroup`, ils retournent 0
2. **Bug potentiel** : Vérifier que `qualityData.novaGroup?.group` est bien extrait

**Solution** :
```typescript
const novaGroupValue = qualityData.novaGroup?.group || 0;

if (novaGroupValue > 0) {
  weightedNovaGroupSum += novaGroupValue * weight;
  novaGroupCount++;
}

// Ne diviser que si des données existent
avgNovaGroup = novaGroupCount > 0 
  ? weightedNovaGroupSum / totalWeight 
  : 0;
```

#### 4. **Génération de Recommandations**

**Règles** (par ordre de priorité) :
1. **Nova 4** (ultra-transformé) → +25 pts, priorité HIGH, couleur ROUGE
2. **NutriScore D/E** → +20 pts, priorité HIGH, couleur ROUGE
3. **≥5 additifs** → +15 pts, priorité MEDIUM, couleur JAUNE
4. **EcoScore D/E** → +10 pts, priorité LOW, couleur BLEUE

**Déduplication** : Un même ingrédient peut avoir plusieurs problèmes. On garde **uniquement la recommandation de plus haute priorité** par ingrédient.

**Code** :
```typescript
// Dédupliquer par ingredientId
const deduped = new Map<string, QualityRecommendation>();
for (const rec of recommendations) {
  const existing = deduped.get(rec.ingredientId);
  if (!existing || priorityOrder[rec.priority] > priorityOrder[existing.priority]) {
    deduped.set(rec.ingredientId, rec);
  }
}
```

**Exemple** :
- Beurre a NutriScore E ET EcoScore D
- On garde : **NutriScore E (+20 pts, HIGH, ROUGE)**
- On ignore : EcoScore D (priorité inférieure)

---

## 🎨 Interface Utilisateur

### RecipeIngredientsWithPricing
**Emplacement** : `/Ui/RecipeDetails/RecipeIngredientsWithPricing.tsx`

**Principe** : Les prix sont **intégrés directement** dans la liste d'ingrédients (pas de section séparée).

**Features** :
- Toggle "Mon prix" / "Prix moyen" (seulement si utilisateur connecté)
- Coût total estimé en haut de la carte
- Prix affiché sous chaque ingrédient (Chip vert avec icône €)
- Magasin et distance en Chips compacts
- Click sur ingrédient → Modal détail produit
- Animation au chargement

**Mobile-First** :
- Layout vertical compact (quantité + nom puis prix + magasin)
- Chips petits (size="sm", text-xs)
- Boutons toggle réduits (h-7 px-2 sur mobile)
- Espacement réduit (space-y-2 sur mobile, space-y-3 desktop)

### RecipeQualitySection
**Emplacement** : `/Ui/RecipeQualitySection.tsx`

**Features** :
- Score global avec bulle colorée (vert/bleu/jaune/rouge)
- Mini-cartes NutriScore / EcoScore / Nova
- Section "Suggestions d'amélioration"
- Accordion "Détail par ingrédient"

**Couleurs des Recommandations** :
| Priorité | Couleur | Signification |
|----------|---------|---------------|
| HIGH | Rouge | Problème majeur (Nova 4, NutriScore E) |
| MEDIUM | Jaune | Problème modéré (additifs) |
| LOW | Bleu | Amélioration mineure (EcoScore) |

**Suppression de "Pondération"** : Ce terme technique n'a pas d'intérêt pour l'utilisateur final. Seuls les scores NutriScore/EcoScore/Nova sont affichés.

---

## 🔧 Configuration Utilisateur

### Structure `optimizationPreferences` (JSON)

**Emplacement** : Champ `optimizationPreferences` du modèle `User`

```json
{
  "latitude": 48.8566,
  "longitude": 2.3522,
  "maxDistanceKm": 10,
  "favoriteStoreIds": ["uuid-store-1", "uuid-store-2"],
  "excludedStoreIds": ["uuid-store-3"],
  "preferredBrands": ["Bio", "Label Rouge"],
  "priceWeight": 0.6,      // Pondération prix (0-1)
  "qualityWeight": 0.25,   // Pondération qualité (0-1)
  "distanceWeight": 0.15   // Pondération distance (0-1)
}
```

**Valeurs par défaut** :
- `maxDistanceKm` : 10 km
- `priceWeight` : 0.6 (60%)
- `qualityWeight` : 0.25 (25%)
- `distanceWeight` : 0.15 (15%)

---

## 📊 Données Produit (nutrition_score)

### Structure JSON

```json
{
  "nutriScore": {
    "grade": "A" | "B" | "C" | "D" | "E" | "unknown",
    "score": 0-100
  },
  "ecoScore": {
    "grade": "A" | "B" | "C" | "D" | "E" | "unknown",
    "score": 0-100
  },
  "novaGroup": {
    "group": 1 | 2 | 3 | 4,
    "score": 0-100
  },
  "overallQualityScore": 0-100,
  "additives": [
    {
      "id": "E330",
      "name": "Acide citrique",
      "riskLevel": "low" | "moderate" | "high" | "unknown"
    }
  ],
  "allergens": ["gluten", "lait"]
}
```

---

## 🚀 Utilisation

### 1. Afficher les Ingrédients avec Prix Intégrés

```tsx
import { RecipeIngredientsWithPricing } from "~/applications/Recipes/Ui/RecipeDetails/RecipeIngredientsWithPricing";

<RecipeIngredientsWithPricing
  recipeId="uuid-recipe"
  ingredients={recipe.ingredients}
  userId="uuid-user"  // Optionnel (mode public si absent)
  onProductClick={(productId) => setSelectedProductId(productId)}
/>
```

### 2. Afficher la Qualité d'une Recette

```tsx
import { RecipeQualitySection } from "~/applications/Recipes/Ui/RecipeQualitySection";

<RecipeQualitySection 
  recipeId="uuid-recipe"
/>
```

### 3. API Directe (Server Actions)

```typescript
import { getRecipePricing } from "~/applications/Recipes/Api/recipes/getRecipePricing.api";
import { getRecipeQuality } from "~/applications/Recipes/Api/recipes/getRecipeQuality.api";

// Prix
const pricing = await getRecipePricing("recipe-id", "user-id");

// Qualité
const quality = await getRecipeQuality("recipe-id");
```

---

## 🐛 Problèmes Connus & Solutions

### 1. **Recommandations Dupliquées**
**Symptôme** : Même ingrédient apparaît 2× avec différents gains (+20, +10)

**Cause** : Un ingrédient peut déclencher plusieurs règles (NutriScore E + EcoScore D)

**Solution** : Déduplication par `ingredientId` (garde priorité la plus haute) ✅

### 2. **Nova Score Global à 0**
**Symptôme** : Nova affiché `0.0` malgré ingrédients avec Nova 2

**Causes** :
- Produits sans `novaGroup` comptent comme 0
- Bug dans l'extraction de `qualityData.novaGroup?.group`

**Solution** : Vérifier que les produits ont bien `nutrition_score.novaGroup.group` renseigné

### 3. **Produits "Unknown" Comptés comme 50/100**
**Symptôme** : Score global faussé par produits sans données

**Solution** : Les "unknown" sont maintenant **exclus** des moyennes ✅

### 4. **Section Qualité Statique en Haut**
**Symptôme** : Affichage d'un score statique non contextualisé

**Solution** : Section statique **supprimée** de `RecipeDetails.tsx` ✅

### 5. **"Pondération" Affiché à l'Utilisateur**
**Symptôme** : Terme technique "Pondération : 250g" visible

**Solution** : Supprimé de l'UI (conservé uniquement en interne) ✅

---

## 📝 Checklist Implémentation

- ✅ RecipePricingService avec computeForUser/computePublic
- ✅ RecipeComputeQualityService avec recommandations
- ✅ Déduplication des recommandations
- ✅ Exclusion des "unknown" des moyennes
- ✅ Prix intégrés directement dans liste ingrédients (UX/UI optimisée)
- ✅ RecipeQualitySection mobile-first
- ✅ Suppression section qualité statique
- ✅ Suppression RecipePricingSection séparée (remplacée par intégration)
- ✅ Intégration dans RecipeDetails
- ✅ Migration Prisma (suppression champs statiques)
- ✅ Documentation complète

---

## 🎯 Prochaines Améliorations

1. **Alternatives Produits** : Suggérer des produits de remplacement avec ID
2. **Historique Prix** : Graphique d'évolution des prix sur 90 jours
3. **Optimisation Panier** : Calcul du meilleur mix magasins vs. trajets
4. **Alertes Prix** : Notification quand un prix baisse
5. **Score Carbone** : Intégrer l'empreinte CO2 dans le calcul qualité

---

## 📞 Support

Pour toute question sur l'architecture ou les calculs, consulter :
- `RecipePricing.service.ts` : Logique de pricing
- `RecipeComputeQuality.service.ts` : Logique de qualité
- Cette documentation : Vue d'ensemble complète
