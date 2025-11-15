# RecipeDetailsMobile - Composant Mobile-First Refactorisé

## 📱 Vue d'ensemble

Composant React refactorisé pour afficher les détails d'une recette dans une expérience **mobile-first** optimisée pour la cuisine. Offre une navigation verticale unique avec toutes les informations nécessaires : ingrédients avec prix, préparation step-by-step, qualité nutritionnelle et conseils actionnables.

---

## 🎯 Objectifs

1. **Lisibilité** : Design épuré, typographie claire, informations hiérarchisées
2. **Exploitabilité** : Mode step-by-step pour suivre la recette en cuisinant
3. **Mobile-first** : Scroll vertical unique, actions accessibles au pouce, sections collapsibles
4. **Informativité** : Prix intégrés, labels (bio/éco/ultra-transformé), allergènes, scores nutritionnels
5. **Actionnabilité** : Conseils personnalisés pour améliorer la recette

---

## 🏗️ Architecture

### Fichiers

```
/Ui/
├── RecipeDetailsMobile.tsx          # Composant UI principal
├── RecipeDetailsContainer.tsx       # Container avec hooks et modals
└── hooks/
    └── useRecipeData.ts             # Hook pour charger pricing + quality
```

### Composants

#### 1. **RecipeDetailsMobile** (Composant UI)
**Rôle** : Affichage pur de la recette avec interactions locales

**Props** :
```typescript
{
  recipe: RecipePayload;
  userId?: string;
  onBack: () => void;
  onAddToList: () => void;
  onShare: () => void;
  onProductClick: (productId: string) => void;
}
```

#### 2. **RecipeDetailsContainer** (Container)
**Rôle** : Gestion des modals, navigation, état global

**Props** :
```typescript
{
  recipe: RecipePayload;
  userId?: string;
}
```

#### 3. **useRecipeData** (Hook)
**Rôle** : Chargement des données pricing + qualité

**Return** :
```typescript
{
  pricing: RecipePricingResult | null;
  quality: RecipeQualityResult | null;
  loading: boolean;
  error: string | null;
}
```

---

## 🎨 Sections du Composant

### 1. **Header Fixe**
- **Position** : `sticky top-0` avec shadow
- **Actions** :
  - ← Retour
  - ❤️ Favoris (toggle rouge quand actif)
  - 🔗 Partage
  - 🛒 Ajouter à liste de courses

**Mobile-first** : Boutons iconOnly compacts, accessible au pouce

---

### 2. **Image Hero**
- **Hauteur** : 224px (h-56) fixe
- **Overlay** : Gradient noir transparent → noir 60% pour lisibilité
- **Animation** : Fade-in (opacity 0→1)

---

### 3. **Titre & Tags**
**Contenu** :
- Titre (text-2xl font-bold)
- Badges cliquables :
  - Difficulté (vert/jaune/rouge selon EASY/MEDIUM/HARD)
  - Portions (icône Users)
  - Temps total (icône Clock)
  - Temps préparation (icône ChefHat, bleu)
  - Temps cuisson (icône Flame, jaune)
- Description (text-sm, gray-600)

**Mobile-first** : Flex-wrap pour retour à la ligne automatique, badges size="md" (touch-friendly)

---

### 4. **Section Ingrédients Enrichie**

**Header** :
- Titre "Ingrédients" + icône ChefHat
- **Coût total** à droite (text-lg font-bold text-primary)
- **Coût par portion** en dessous (text-xs gray-500)

**Options** :
- Toggle "Masquer les ingrédients sans prix" si applicable
- Compteur "{X} sans prix"

**Liste d'ingrédients** (par ingrédient) :
```
┌─────────────────────────────────────────┐
│ • Nom du produit          500g          │
│   💰 2.45€  🏪 Carrefour  📍 2.3 km     │
│   🌱 Bio  ⚠️ gluten  NS: A              │
└─────────────────────────────────────────┘
```

**Détails ligne par ligne** :
1. **Ligne 1** : Nom produit (font-semibold) + quantité/unité (flex-end)
2. **Ligne 2** : Prix (Chip vert success) + Magasin (Chip flat) + Distance (Chip avec MapPin)
3. **Ligne 3** : 
   - **Labels** : Bio (vert), Éco (bleu), Ultra-transformé (rouge)
   - **Allergènes** : Chips jaune bordered
   - **NutriScore** : Chip "NS: {grade}"

**Interactions** :
- Click sur ingrédient → Modal détail produit
- Hover → Background gray-50

**Color-coding** :
| Label | Couleur | Icône |
|-------|---------|-------|
| Bio | success (vert) | Leaf |
| Éco | primary (bleu) | Leaf |
| Ultra-transformé | danger (rouge) | AlertCircle |

---

### 5. **Section Préparation avec Step-by-Step**

**Modes** :
1. **Liste complète** (défaut) : Toutes les étapes avec checkboxes
2. **Step-by-step** : Une étape à la fois avec navigation

**Header** :
- Titre "Préparation" + icône Flame
- Toggle "Étape par étape" / "Liste complète"

#### Mode Step-by-Step

**Indicateurs** :
- "Étape X / Total"
- "X / Total terminées"
- Barre de progression visuelle (h-1.5, bg-primary)

**Carte étape actuelle** :
- Background bleu clair (`bg-primary/5`)
- Border bleu (`border-2 border-primary/20`)
- Numéro rond (w-10 h-10, bg-primary, blanc)
- Description (text-sm leading-relaxed)
- Chip temps si disponible (Clock icon)

**Navigation** :
```
[← Précédent]  [✓ Marquer terminé]  [Suivant →]
```
- Boutons désactivés aux extrémités
- Bouton central change : "Marquer terminé" (vert) → "Fait" (gris + ✓)

#### Mode Liste Complète

**Checklist** :
- Checkbox à gauche (size="md", color="success")
- Numéro rond (w-7 h-7, plus petit qu'en step-by-step)
- Chip temps si disponible
- Description avec line-through si cochée
- Background vert clair si terminée (`bg-success/10 border-success/20`)

---

### 6. **Section Qualité Nutritionnelle**

**Header** :
- Titre "Qualité nutritionnelle" + icône TrendingUp

**Score global** :
```
┌──────────────────────────────────────┐
│  ⭕ 75      Bon                       │
│    /100    Cette recette est bonne   │
│            avec quelques améliorations│
└──────────────────────────────────────┘
```
- Cercle coloré (w-16 h-16) : vert ≥80, jaune ≥60, rouge <60
- Label : "Excellent" / "Bon" / "À améliorer"
- Texte explicatif (text-xs gray-500)

**Badges NutriScore / EcoScore / Nova** :
- Grid 3 colonnes égales
- Background gray-50
- Label + Chip avec grade/valeur

**Conseils actionnables** :
```
┌─────────────────────────────────────────┐
│ ⚠️ Remplacer le beurre par huile d'olive│
│    Amélioration de +15 points           │
├─────────────────────────────────────────┤
│ 🌱 Privilégier des produits bio         │
│    Amélioration de +10 points           │
└─────────────────────────────────────────┘
```
- Border-left coloré (rouge = HIGH, jaune = MEDIUM, bleu = LOW)
- Icône selon type (AlertCircle, Leaf)
- Titre (font-medium) + gain de points

**Toggle "Voir détails nutrition"** :
- Bouton fullWidth flat
- Déploie Accordion avec détails par ingrédient
- Animation height 0→auto

**Accordion détails** (collapsible) :
- Par ingrédient (3 premiers affichés)
- Affiche : NutriScore, Labels, Allergènes

---

### 7. **Section Infos Complémentaires** (Collapsible)

**Accordion** :
- **Astuces & Conseils** : Tips de préparation, variantes
- **Conservation** : Durée et méthode de conservation

**Mobile-first** : Accordion bordered pour économiser l'espace vertical

---

## 🎨 Design System

### Couleurs par Score

| Score | Classe | Couleur |
|-------|--------|---------|
| ≥80 | `bg-green-100 text-green-600` | Vert (Excellent) |
| 60-79 | `bg-yellow-100 text-yellow-600` | Jaune (Bon) |
| <60 | `bg-red-100 text-red-600` | Rouge (À améliorer) |

### Grades (NutriScore/EcoScore)

| Grade | Color HeroUI |
|-------|--------------|
| A | success |
| B | primary |
| C | warning |
| D, E | danger |

### Espacement Mobile-First

| Élément | Mobile | Desktop |
|---------|--------|---------|
| Padding carte | p-4 | p-6 |
| Gap liste | space-y-2 | space-y-3 |
| Text base | text-sm | text-base |
| Boutons | h-7 px-2 | h-8 px-3 |

### Animations

| Élément | Animation |
|---------|-----------|
| Image | `initial={{ opacity: 0 }}` |
| Sections | `initial={{ opacity: 0, y: 20 }}` |
| Ingrédients | `initial={{ opacity: 0, x: -10 }}` |
| Détails nutrition | `initial={{ opacity: 0, height: 0 }}` |

**Délais** : Stagger de 0.1s entre sections, 0.05s entre items de liste

---

## 🔧 Intégration

### Usage avec Container

```tsx
import { RecipeDetailsContainer } from "~/applications/Recipes/Ui/RecipeDetailsContainer";

export default function RecipePage({ params }: { params: { id: string } }) {
  const recipe = await getRecipe(params.id);
  const session = await auth();

  return <RecipeDetailsContainer recipe={recipe} userId={session?.user?.id} />;
}
```

### Usage Direct (sans modals)

```tsx
import RecipeDetailsMobile from "~/applications/Recipes/Ui/RecipeDetailsMobile";

<RecipeDetailsMobile
  recipe={recipe}
  userId={userId}
  onBack={() => router.push("/recipes")}
  onAddToList={() => console.log("Add to list")}
  onShare={() => console.log("Share")}
  onProductClick={(id) => console.log("Product", id)}
/>
```

### Usage du Hook

```tsx
import { useRecipeData } from "~/applications/Recipes/Ui/hooks/useRecipeData";

const { pricing, quality, loading, error } = useRecipeData({
  recipeId: recipe.id,
  userId: session?.user?.id
});

// pricing.breakdown pour les prix par ingrédient
// quality.recommendations pour les conseils
```

---

## 🚀 Fonctionnalités Avancées

### 1. **Mode Step-by-Step**
- État local : `stepByStepMode`, `currentStep`, `stepsCompleted`
- Navigation : `goToNextStep()`, `goToPreviousStep()`
- Progression : Barre visuelle + compteur

### 2. **Filtrage Ingrédients sans Prix**
- État : `hideNoPriceIngredients`
- Affiche : `visibleIngredients` (filtré dynamiquement)
- Compteur : `ingredientsWithoutPrice`

### 3. **Favoris**
- État local : `isFavorite`
- UI : Icône cœur rouge remplie quand actif
- TODO : Persister dans DB

### 4. **Détails Nutrition Collapsibles**
- État : `showNutritionDetails`
- Animation : `height: 0 → auto` avec framer-motion
- Contenu : Accordion avec max 3 ingrédients

---

## 📊 Données Mock vs Réelles

### Mock Data (actuellement)

```typescript
const ingredientsWithPrice: IngredientWithPrice[] = recipe.ingredients?.map((ing) => ({
  id: ing.id,
  name: ing.productName || "Product",
  quantity: ing.quantity,
  unit: ing.unit,
  price: Math.random() > 0.3 ? Math.random() * 10 : undefined,
  store: Math.random() > 0.3 ? "Carrefour" : undefined,
  distance: Math.random() > 0.3 ? Math.random() * 5 : undefined,
  labels: Math.random() > 0.5 ? ["bio"] : [],
  allergens: Math.random() > 0.7 ? ["gluten"] : [],
  nutriScore: Math.random() > 0.5 ? "A" : "C",
  productId: ing.productId
})) || [];
```

### Vraies Données (avec useRecipeData)

```typescript
// Dans RecipeDetailsMobile, remplacer mock par :
const { pricing, quality, loading, error } = useRecipeData({
  recipeId: recipe.id,
  userId
});

// Mapper pricing.breakdown vers IngredientWithPrice[]
const ingredientsWithPrice = recipe.ingredients?.map((ing) => {
  const priceData = pricing?.breakdown.find((b) => b.ingredientId === ing.id);
  const qualityData = quality?.details.find((d) => d.ingredientId === ing.id);
  
  return {
    id: ing.id,
    name: ing.productName || "Product",
    quantity: ing.quantity,
    unit: ing.unit,
    price: priceData?.selected?.price,
    store: priceData?.selected?.storeName,
    distance: priceData?.selected?.distanceKm,
    labels: extractLabels(qualityData), // À implémenter
    allergens: qualityData?.allergens || [],
    nutriScore: qualityData?.nutriScore,
    productId: ing.productId
  };
});
```

---

## 🐛 Points d'Attention

### 1. **Récupération Labels (bio/éco/ultra-transformé)**
Les labels ne sont pas directement disponibles dans `QualityBreakdownItem`. Options :
- Ajouter `labels` dans `RecipeComputeQuality.service.ts`
- Déduire depuis `novaGroup` (Nova 4 = ultra-processed)
- Utiliser `isOpenFoodFacts` du produit

### 2. **Allergènes**
Actuellement dans `nutrition_score.allergens` (JSON). S'assurer que `RecipeComputeQuality` les extrait correctement.

### 3. **Performance**
- `useRecipeData` fait 2 appels API parallèles (pricing + quality)
- Considérer mise en cache ou SWR pour éviter rechargements

### 4. **Navigation Step-by-Step**
État local uniquement. Si l'utilisateur quitte la page, progression perdue. Considérer :
- LocalStorage pour persister
- Paramètre URL `?step=3`

---

## 📱 Responsive Breakpoints

| Breakpoint | Valeur | Usage |
|------------|--------|-------|
| Base | <640px | Mobile |
| sm: | ≥640px | Tablet petit |
| md: | ≥768px | Tablet |
| lg: | ≥1024px | Desktop |

**Principe** : Tout est optimisé pour base (mobile), puis amélioré progressivement.

---

## ✅ Checklist Implémentation

- ✅ RecipeDetailsMobile composant UI
- ✅ RecipeDetailsContainer avec modals
- ✅ useRecipeData hook
- ✅ Header fixe avec actions rapides
- ✅ Section ingrédients enrichie (prix, labels, allergènes)
- ✅ Mode step-by-step préparation
- ✅ Checklist étapes avec progression
- ✅ Qualité nutritionnelle avec conseils
- ✅ Détails nutrition collapsibles
- ✅ Infos complémentaires (accordion)
- ✅ Animations framer-motion
- ✅ Design mobile-first complet
- ⚠️ TODO : Connecter vraies données (remplacer mock)
- ⚠️ TODO : Extraire labels (bio/éco/ultra-transformé)
- ⚠️ TODO : Implémenter système favoris persistant
- ⚠️ TODO : Ajouter photos/vidéos par étape (futur)

---

## 🎯 Prochaines Étapes

1. **Connecter vraies données**
   - Remplacer mock par `useRecipeData` dans RecipeDetailsMobile
   - Mapper `pricing.breakdown` et `quality.details`
   - Extraire labels depuis nutrition_score

2. **Améliorer extraction labels**
   - Ajouter `labels: string[]` dans `QualityBreakdownItem`
   - Détecter "bio" depuis product flags
   - Déduire "ultra-processed" depuis Nova 4

3. **Persistance progression**
   - localStorage pour étapes terminées
   - Restaurer état au chargement

4. **Features avancées**
   - Photos par étape (upload + display)
   - Mini-vidéos (YouTube embed ou Blob)
   - Variantes recette (végétarien, sans gluten)
   - Note moyenne utilisateurs

---

## 📞 Support

**Architecture** : Voir `RECIPE_PRICING_QUALITY_README.md` pour détails services
**Design** : HeroUI beta + Tailwind CSS 4 + Framer Motion
**i18n** : Lingui (`<Trans>` + `useLingui()` + `t` macro)
