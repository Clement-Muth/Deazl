# ProductQuickView - Documentation complète

## Vue d'ensemble

Le système ProductQuickView affiche maintenant **toutes les informations disponibles sur OpenFoodFacts** :

- ✅ Scores de qualité (NutriScore, EcoScore, Nova)
- ✅ Informations nutritionnelles complètes (100g)
- ✅ Additifs avec niveau de risque
- ✅ Allergènes
- ✅ Labels et certifications (Bio, Fair Trade, etc.)
- ✅ Liste d'ingrédients
- ✅ Avertissements santé
- ✅ Comparaison intelligente enrichie

## Architecture des données

### ProductQualityData (enrichi)

```typescript
{
  // Scores de qualité
  nutriScore?: { grade: "A-E", score: 0-100 }
  novaGroup?: { group: 1-4, score: 0-100 }
  ecoScore?: { grade: "A-E", score: 0-100 }
  overallQualityScore?: 0-100

  // Nutrition (pour 100g)
  nutriments?: {
    energyKcal: number
    energyKj: number
    fat: number
    saturatedFat: number
    carbohydrates: number
    sugars: number
    fiber: number
    proteins: number
    salt: number
    sodium: number
  }

  // Additifs
  additives?: Array<{
    id: string              // Ex: "en:e330"
    name: string            // Ex: "Acide citrique"
    riskLevel: "low" | "moderate" | "high" | "unknown"
  }>

  // Allergènes
  allergens?: string[]      // Ex: ["gluten", "milk", "nuts"]

  // Labels
  labels?: string[]         // Ex: ["organic", "fair-trade"]

  // Ingrédients
  ingredients?: {
    text: string           // Liste complète des ingrédients
    count: number          // Nombre d'ingrédients
    hasAllergens: boolean
    hasPalmOil: boolean
  }

  // Avertissements santé
  healthWarnings?: {
    hasSugar: boolean      // > 15g/100g
    hasSalt: boolean       // > 1.5g/100g
    hasSaturatedFat: boolean // > 5g/100g
  }
}
```

## Composants UI

### 1. ProductNutrition

Affiche le tableau nutritionnel complet pour 100g avec :
- Valeurs nutritionnelles détaillées
- Indicateurs de niveau (faible/modéré/élevé) pour graisses, sucres, sel
- Barre de progression de l'apport énergétique (% de 2000 kcal)
- Avertissements santé si teneurs élevées

**Utilisation :**
```tsx
<ProductNutrition qualityData={product.qualityData} />
```

### 2. ProductAdditives

Liste tous les additifs avec niveau de risque :
- Badge "Aucun additif" si produit sans additifs
- Liste des additifs avec couleur selon risque
- Alerte si additifs à risque élevé ou modéré
- Compteur d'additifs

**Utilisation :**
```tsx
<ProductAdditives qualityData={product.qualityData} />
```

### 3. ProductLabelsAndIngredients

Affiche :
- Labels et certifications (Bio, Commerce Équitable, etc.)
- Liste complète des ingrédients
- Badges allergènes et huile de palme
- Section allergènes mise en évidence

**Utilisation :**
```tsx
<ProductLabelsAndIngredients qualityData={product.qualityData} />
```

### 4. ProductDetailedView

Vue complète avec accordéon pour organiser l'information :
- Badges de qualité en haut
- Sections dépliables (nutrition, additifs, ingrédients)
- Ouvre automatiquement la section nutrition
- Message si pas de données

**Utilisation :**
```tsx
<ProductDetailedView qualityData={product.qualityData} />
```

## Comparaison enrichie

Le composant `ProductComparison` affiche maintenant pour chaque produit :

### Badges additionnels :
- Nutri-Score, Eco-Score, Nova Group
- Nombre d'additifs avec couleur selon risque
- Nombre d'allergènes
- Nombre de labels

**Exemple visuel :**
```
#1 Produit A                    92/100
    Marque X
    2.50€  |  Qualité 95/100  |  3 magasins
    [Nutri: A] [Eco: B] [Nova: 1] [Bio]
```

## Extraction des données OpenFoodFacts

La fonction `parseOpenFoodFactsQuality()` extrait maintenant :

```typescript
// Depuis l'API OpenFoodFacts v2
const offData = await fetch(`https://world.openfoodfacts.org/api/v2/product/${barcode}.json`)
const product = offData.product

// Extraction enrichie :
- nutriments (avec chemins multiples: nutriments_100g, nutriments)
- additives_tags + additives_names
- allergens_tags
- labels_tags
- ingredients_text + ingredients array
- Calcul des avertissements santé basé sur seuils
```

## Seuils santé utilisés

### Nutrition (pour 100g) :
- **Sucres** : Faible < 5g, Modéré 5-22.5g, Élevé > 22.5g
- **Sel** : Faible < 0.3g, Modéré 0.3-1.5g, Élevé > 1.5g
- **Graisses saturées** : Faible < 1.5g, Modéré 1.5-5g, Élevé > 5g
- **Matières grasses** : Faible < 3g, Modéré 3-17.5g, Élevé > 17.5g

### Avertissements (déclenchés si) :
- Sucres > 15g/100g
- Sel > 1.5g/100g
- Graisses saturées > 5g/100g

## Intégration dans ProductQuickView

Le composant principal affiche désormais 3 sous-composants :

```tsx
<section className="space-y-3">
  <ProductQualityBadges qualityData={product.qualityData} />
  <ProductNutrition qualityData={product.qualityData} />
  <ProductAdditives qualityData={product.qualityData} />
  <ProductLabelsAndIngredients qualityData={product.qualityData} />
</section>
```

## Design System

### Couleurs par niveau de risque :

**Additifs :**
- `success` (vert) : Risque faible
- `warning` (orange) : Risque modéré
- `danger` (rouge) : Risque élevé
- `default` (gris) : Risque inconnu

**Nutriments :**
- `success` : Niveau faible (bon)
- `warning` : Niveau modéré
- `danger` : Niveau élevé (mauvais)

**Avertissements :**
- Fond orange clair (`orange-50`)
- Bordure orange (`orange-200`)
- Texte orange foncé (`orange-700`)
- Icône `AlertTriangleIcon`

## Performance

### Optimisations :
- Chargement paresseux des sections (accordéon)
- Composants conditionnels (n'affiche que si données disponibles)
- Extraction optimisée avec chemins multiples
- Badges mis en cache dans les comparaisons

## Accessibilité

- Labels ARIA sur tous les éléments interactifs
- Contraste couleurs respectant WCAG 2.1 AA
- Navigation clavier dans l'accordéon
- Messages d'erreur explicites

## Exemples d'utilisation

### Affichage complet dans un modal :
```tsx
<Modal
  isOpen={isOpen}
  onClose={onClose}
  header={<h2>Détails du produit</h2>}
  body={
    <div className="space-y-4">
      <ProductDetailedView qualityData={qualityData} />
      <ProductPriceList prices={prices} />
    </div>
  }
/>
```

### Comparaison de produits :
```tsx
<ProductComparison
  isOpen={isOpen}
  onClose={onClose}
  currentProduct={{
    id: "123",
    name: "Produit A",
    qualityData: { /* données complètes */ },
    prices: [...]
  }}
/>
```

## Tests recommandés

1. **Produit complet** (ex: "3017620422003" - Nutella)
   - Tous les champs remplis
   - Additifs + allergènes + labels

2. **Produit minimal** (nouveau produit local)
   - Seulement prix + nom
   - Pas de données OFF

3. **Produit bio** (avec labels)
   - Vérifier affichage des certifications
   - Labels multiples

4. **Produit avec additifs à risque**
   - Vérifier alertes
   - Couleurs correctes

## Roadmap

### Court terme :
- [ ] Graphiques nutritionnels visuels
- [ ] Filtres de comparaison par allergènes
- [ ] Export des données nutritionnelles

### Moyen terme :
- [ ] Historique des modifications OFF
- [ ] Score environnemental détaillé
- [ ] Recommandations personnalisées

### Long terme :
- [ ] Analyse IA des ingrédients
- [ ] Suggestions d'alternatives plus saines
- [ ] Base de données offline
