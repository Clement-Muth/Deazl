# Fonctionnalité d'Optimisation des Prix - Liste de Courses Interactive

## 📋 Vue d'ensemble

Cette fonctionnalité permet aux utilisateurs de comparer et d'optimiser automatiquement les prix de leurs articles de liste de courses en fonction de plusieurs critères pondérés.

## 🎯 Fonctionnalités Implémentées

### 1. Modèle de Données

**Modifications du schéma Prisma :**
- ✅ Ajout de `selectedPriceId` sur `ShoppingListItem` (relation vers `Price`)
- ✅ Ajout de `notes` sur `ShoppingListItem` pour des informations complémentaires
- ✅ Migration créée : `20251112153506_add_selected_price_id_in_shopping_list`

**Entités Domain :**
- ✅ Mise à jour de `ShoppingListItem.entity.ts` avec `selectedPriceId` et `selectedPrice`
- ✅ Méthode `withSelectedPrice()` pour mise à jour immutable
- ✅ Schéma Zod mis à jour avec validation des nouvelles propriétés

### 2. Service d'Optimisation

**`PriceOptimizationService`** (`Domain/Services/PriceOptimization.service.ts`)

Algorithme de scoring multi-critères :

#### Critères de Sélection (Pondérables)
- **Prix** (40% par défaut) : Favorise les options les moins chères
- **Qualité** (30% par défaut) : Score nutritionnel + marques préférées
- **Distance** (20% par défaut) : Proximité du magasin
- **Disponibilité** (10% par défaut) : Stock disponible

#### Fonctionnalités
```typescript
// Optimiser un seul item
PriceOptimizationService.optimizeItem(alternatives, preferences)

// Optimiser toute la liste
PriceOptimizationService.optimizeList(itemsWithAlternatives, preferences)

// Préférences par défaut
PriceOptimizationService.defaultPreferences()
```

#### Normalisation des Scores
- Chaque critère est normalisé entre 0 et 1
- Calcul : `score = Σ(criteriaScore × weight)`
- L'alternative avec le score le plus élevé est choisie

#### Explications Automatiques
Le service génère des raisons lisibles :
- "Meilleur prix"
- "Meilleure qualité"
- "Magasin le plus proche"
- "Marque préférée (Nom)"
- "Meilleur compromis qualité-prix-distance"

### 3. Server Actions

**`selectItemPrice.api.ts`**
- Sélection manuelle d'un prix pour un item
- Vérification des permissions (propriétaire ou éditeur)
- Mise à jour immutable de l'entité

**`optimizeShoppingList.api.ts`**
- Optimisation automatique de tous les items de la liste
- Récupération des prix depuis Prisma
- Application des préférences utilisateur
- Retour des résultats avec explications

**`getItemPriceAlternatives.api.ts`**
- Récupération de toutes les alternatives de prix pour un produit
- Inclut les informations du magasin, score nutritionnel
- Triées par prix croissant

### 4. Composants UI

**`ItemPriceAlternativesModal`**
```tsx
<ItemPriceAlternativesModal
  isOpen={isOpen}
  onClose={onClose}
  itemId="uuid"
  itemName="Product Name"
  currentPriceId="uuid"
  alternatives={priceAlternatives}
  onPriceSelected={(priceId) => {}}
/>
```

Fonctionnalités :
- ✅ Modal/BottomSheet mobile-first
- ✅ Tri par prix, qualité, distance
- ✅ Badge "Meilleur prix" sur l'option la moins chère
- ✅ Affichage du Nutri-Score (A-E)
- ✅ Distance du magasin (si disponible)
- ✅ Indicateur de sélection
- ✅ Sélection en un tap

**`OptimizeListButton`**
```tsx
<OptimizeListButton
  listId="uuid"
  onOptimizationComplete={() => {}}
/>
```

Fonctionnalités :
- ✅ Bouton avec icône Sparkles
- ✅ État de chargement
- ✅ Toast de succès avec nombre d'items optimisés
- ✅ Gestion d'erreurs avec feedback utilisateur

## 🔄 Flux d'Utilisation

### Sélection Manuelle
1. L'utilisateur clique sur un item de la liste
2. Ouvre le modal des alternatives (`ItemPriceAlternativesModal`)
3. Consulte les options disponibles avec tri/filtre
4. Sélectionne une alternative
5. Le système met à jour `selectedPriceId` via Server Action
6. L'UI se met à jour avec le nouveau prix

### Optimisation Automatique
1. L'utilisateur clique sur "Optimiser la liste" (`OptimizeListButton`)
2. Le système récupère toutes les alternatives pour chaque item
3. L'algorithme calcule les scores pour chaque alternative
4. Les meilleurs choix sont automatiquement sélectionnés
5. L'UI affiche un toast avec le nombre d'items optimisés
6. Les badges d'explication apparaissent sur chaque item

## 🎨 UX Mobile-First

### Interactions Tactiles
- ✅ BottomSheet pour les modals sur mobile
- ✅ Boutons adaptés au touch (44x44px minimum)
- ✅ Listes scrollables avec momentum
- ✅ Swipe pour fermer les modals

### Responsive Design
- ✅ Layout adaptatif mobile/tablette/desktop
- ✅ Tailwind CSS avec classes responsive
- ✅ Typographie et espacements optimisés
- ✅ Chips et badges lisibles sur petit écran

### Performance
- ✅ Chargement lazy des alternatives
- ✅ Memoization des calculs de tri
- ✅ Batch updates pour l'optimisation
- ✅ Feedback immédiat sur les actions

## 📊 Structure du Projet

```
apps/pcomparator/src/packages/applications/shopping-lists/
├── Api/
│   ├── items/
│   │   ├── selectItemPrice.api.ts          # Sélection manuelle
│   │   └── getItemPriceAlternatives.api.ts # Récupération alternatives
│   └── shoppingLists/
│       └── optimizeShoppingList.api.ts     # Optimisation auto
├── Domain/
│   ├── Entities/
│   │   └── ShoppingListItem.entity.ts      # Entité mise à jour
│   ├── Schemas/
│   │   └── ShoppingListItem.schema.ts      # Validation Zod
│   └── Services/
│       └── PriceOptimization.service.ts    # Algorithme d'optimisation
└── Ui/
    └── ShoppingListDetails/
        ├── ItemPriceAlternativesModal/     # Modal alternatives
        └── OptimizeListButton/             # Bouton optimisation
```

## 🔧 Configuration

### Préférences Utilisateur (Extensible)

```typescript
interface UserPreferences {
  // Poids des critères (total = 1.0)
  priceWeight: number;         // Par défaut: 0.4
  qualityWeight: number;       // Par défaut: 0.3
  distanceWeight: number;      // Par défaut: 0.2
  availabilityWeight: number;  // Par défaut: 0.1
  
  // Filtres
  maxDistance?: number;        // Distance max en km
  preferredBrands?: string[];  // Marques favorites
  excludedStores?: string[];   // Magasins exclus
}
```

### Utilisation
```typescript
const result = await optimizeShoppingList(listId, {
  priceWeight: 0.5,        // Plus d'importance au prix
  qualityWeight: 0.4,      // Moins à la qualité
  maxDistance: 5,          // Max 5km
  preferredBrands: ["Bio", "Carrefour"]
});
```

## 🚀 Prochaines Étapes (Extensions Futures)

### Fonctionnalités à Implémenter

1. **Géolocalisation**
   - Calcul automatique de la distance utilisateur-magasin
   - Tri par proximité réelle
   - Affichage sur carte interactive

2. **Historique des Choix**
   - Traçabilité des sélections manuelles vs automatiques
   - Analyse des préférences utilisateur
   - Suggestions personnalisées

3. **Alertes Prix**
   - Notification quand un prix baisse
   - Tracking des variations de prix
   - Meilleur moment pour acheter

4. **Stock en Temps Réel**
   - Intégration API magasins partenaires
   - Exclusion automatique des ruptures
   - Alternatives suggérées

5. **Optimisation Multi-Magasins**
   - Regroupement intelligent par magasin
   - Calcul du trajet optimal
   - Comparaison coût total + essence

6. **Profils Utilisateur**
   - Sauvegarde des préférences
   - Profils multiples (économique, bio, local)
   - Switch rapide entre profils

## 📝 Exemples d'Utilisation

### Dans une Page de Détails de Liste

```tsx
import { OptimizeListButton } from "~/packages/applications/shopping-lists/src/Ui/ShoppingListDetails/OptimizeListButton";

export default function ShoppingListPage({ listId }) {
  return (
    <div>
      <OptimizeListButton
        listId={listId}
        onOptimizationComplete={() => {
          // Recharger la liste
          router.refresh();
        }}
      />
      {/* Items de la liste */}
    </div>
  );
}
```

### Dans un Item de Liste

```tsx
import { ItemPriceAlternativesModal } from "~/packages/applications/shopping-lists/src/Ui/ShoppingListDetails/ItemPriceAlternativesModal";
import { getItemPriceAlternatives } from "~/packages/applications/shopping-lists/src/Api/items/getItemPriceAlternatives.api";

export function ShoppingListItem({ item }) {
  const [isOpen, setIsOpen] = useState(false);
  const [alternatives, setAlternatives] = useState([]);

  const handleOpenModal = async () => {
    const result = await getItemPriceAlternatives(item.id);
    if (result.success) {
      setAlternatives(result.alternatives);
      setIsOpen(true);
    }
  };

  return (
    <>
      <button onClick={handleOpenModal}>
        Choisir un prix
      </button>
      
      <ItemPriceAlternativesModal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        itemId={item.id}
        itemName={item.product.name}
        currentPriceId={item.selectedPriceId}
        alternatives={alternatives}
      />
    </>
  );
}
```

## 🧪 Tests

### Tests à Créer

```typescript
// PriceOptimization.service.spec.ts
describe("PriceOptimizationService", () => {
  it("should select cheapest when price weight is 1.0");
  it("should respect max distance filter");
  it("should exclude out of stock items");
  it("should give bonus to preferred brands");
  it("should normalize scores between 0 and 1");
  it("should generate correct reason messages");
});
```

## 🔐 Sécurité

- ✅ Vérification d'authentification sur tous les Server Actions
- ✅ Validation des permissions (propriétaire/collaborateur)
- ✅ Validation Zod des données d'entrée
- ✅ Protection contre les injections SQL (Prisma)
- ✅ Gestion d'erreurs avec messages génériques

## 📱 Accessibilité

- ✅ Labels ARIA sur tous les contrôles interactifs
- ✅ Navigation au clavier dans les modals
- ✅ Indicateurs visuels de sélection
- ✅ Contrastes de couleurs respectés (WCAG AA)
- ✅ Tailles de texte adaptatives

## 🎯 Résultat Final

Une liste de courses **interactive, mobile-first et intelligente** permettant :
- ✅ Comparaison visuelle de tous les prix disponibles
- ✅ Optimisation automatique en 1 clic
- ✅ Transparence sur les choix avec explications claires
- ✅ UX fluide et intuitive sur mobile
- ✅ Architecture extensible pour futures fonctionnalités
- ✅ Performance optimale avec batch operations
