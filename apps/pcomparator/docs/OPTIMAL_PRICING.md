# Système de Prix Optimal - Documentation

## Vue d'ensemble

Le système de prix optimal permet de sélectionner intelligemment les meilleurs prix pour une liste de courses en tenant compte de multiples critères :
- **Prix** : Montant du produit
- **Distance** : Proximité du magasin (à vol d'oiseau)
- **Préférences utilisateur** : Magasins favoris, rayon maximum
- **Magasins sélectionnés** : Affichage des prix pour un/des magasins spécifiques

## Architecture

```
Domain/
├── Services/
│   ├── GeolocationService.ts       # Calcul distance Haversine
│   └── OptimalPricingService.ts    # Logique de sélection optimale
└── Utils/
    └── priceComparison.ts          # Utilitaires de comparaison

Ui/
└── ShoppingListDetails/
    ├── useOptimalPricing.ts        # Hook React pour composants
    ├── PriceSuggestion.tsx         # Affichage prix + distance + suggestions
    └── TotalCostSummary.tsx        # Résumé total avec magasins
```

## Cas d'usage

### 1. Aucun magasin sélectionné (Mode optimal automatique)

**Comportement** :
- Sans géolocalisation : Affiche le **meilleur prix** absolu
- Avec géolocalisation : Calcule un **score combiné** (prix + distance)
  - Formule : `score = prix × 0.7 + (distance × 0.5) × 0.3`
  - Distance "coûte" 0.5€/km par défaut
- Si magasins favoris définis : Privilégie automatiquement ces magasins

**Affichage** :
```
🛒 Tomates • 2.54€/kg @ Carrefour • 📍 1.2km • ✓ (optimal)
```

### 2. Un magasin sélectionné (Mode magasin préféré)

**Comportement** :
- Affiche le prix du magasin sélectionné
- **Suggère des économies** si un meilleur prix existe ailleurs
- Compare avec le meilleur prix tous magasins confondus

**Affichage** :
```
🛒 Tomates • 3.20€/kg @ Auchan • 📍 0.5km | 📉 -0.66€ @ Carrefour • 📍 1.2km
```
(Indique que Carrefour à 1.2km permettrait d'économiser 0.66€)

### 3. Plusieurs magasins sélectionnés

**Comportement** :
- Choisit le meilleur prix parmi les magasins sélectionnés
- Suggère des économies si un meilleur prix existe dans d'autres magasins

### 4. Rayon maximum défini (avec géolocalisation)

**Comportement** :
- Filtre les magasins au-delà du rayon
- Applique ensuite la sélection optimale sur les magasins dans le rayon

## Modèle de données

### Store (Prisma)
```prisma
model Store {
  id          String  @id @default(uuid())
  name        String
  location    String
  latitude    Float?  // Nouvelle colonne
  longitude   Float?  // Nouvelle colonne
  website_url String?
  prices      Price[]
}
```

### UserOptimizationPreferences (JSON dans User)
```typescript
interface UserOptimizationPreferences {
  favoriteStoreIds?: string[];     // IDs magasins favoris
  userLocation?: Coordinates;      // Position actuelle
  maxRadiusKm?: number;            // Rayon max (ex: 5km)
  priceWeight?: number;            // Pondération prix (0-1, défaut 0.7)
  showSavingSuggestions?: boolean; // Afficher suggestions (défaut true)
}
```

### OptimalPriceResult
```typescript
interface OptimalPriceResult {
  price: PriceData;              // Prix sélectionné
  savings: number;               // Économie vs pire prix
  savingsPercentage: number;     // % économie
  rank: number;                  // Classement (1 = meilleur)
  distanceKm?: number;           // Distance magasin (si géoloc active)
  score?: number;                // Score combiné prix+distance
  betterAlternative?: {          // Meilleure alternative (si magasin préféré)
    price: PriceData;
    savings: number;
    savingsPercentage: number;
    distanceKm?: number;
  } | null;
}
```

## Utilisation du hook

```tsx
import { useOptimalPricing } from "./useOptimalPricing";

function ShoppingListContainer({ items }) {
  const {
    itemPrices,      // Record<itemId, ItemOptimalPrice>
    totalCost,       // Total optimisé
    potentialSavings,// Économies possibles
    storeSummary,    // Résumé par magasin
    loading,
    error
  } = useOptimalPricing(items, {
    selectedStoreIds: selectedStore?.id ? [selectedStore.id] : undefined,
    userPreferences: {
      userLocation: { latitude: 48.5734, longitude: 7.7521 },
      maxRadiusKm: 10,
      favoriteStoreIds: ["store-id-1", "store-id-2"],
      priceWeight: 0.7,
      showSavingSuggestions: true
    }
  });

  return (
    <div>
      <TotalCostSummary 
        totalCost={totalCost}
        potentialSavings={potentialSavings}
        storeSummary={storeSummary}
      />
      
      {items.map(item => {
        const optimalPrice = itemPrices[item.id];
        return (
          <div key={item.id}>
            {item.name}: {optimalPrice?.selectedPrice?.price.amount}€
            {optimalPrice?.distanceKm && ` - ${optimalPrice.distanceKm}km`}
          </div>
        );
      })}
    </div>
  );
}
```

## Service OptimalPricingService

### Méthodes principales

#### `selectOptimalPrice()`
Sélectionne le meilleur prix pour un article selon les options.

```typescript
const service = new OptimalPricingService();
const result = service.selectOptimalPrice(
  itemId,
  productId,
  quantity,
  unit,
  availablePrices,
  {
    selectedStoreIds: ["store-1"],
    userPreferences: {
      userLocation: { latitude: 48.5734, longitude: 7.7521 },
      maxRadiusKm: 10
    }
  }
);

// result.selectionReason peut être :
// - "user_selected_store"    : Magasin sélectionné par l'utilisateur
// - "favorite_store"         : Magasin favori
// - "best_price"             : Meilleur prix absolu
// - "best_price_distance"    : Meilleur compromis prix+distance
// - "no_price_available"     : Aucun prix disponible
```

#### `calculateOptimalTotal()`
Calcule le total pour une liste complète et retourne le résumé par magasin.

```typescript
const result = service.calculateOptimalTotal(items, options);
// Returns: {
//   totalCost: 45.32,
//   itemsWithPrices: ItemOptimalPrice[],
//   storeSummary: [
//     { storeId: "1", storeName: "Carrefour", itemCount: 5, subtotal: 25.00 },
//     { storeId: "2", storeName: "Auchan", itemCount: 3, subtotal: 20.32 }
//   ],
//   potentialSavings: 2.50
// }
```

## Service GeolocationService

### Calcul de distance (Haversine)

```typescript
import { calculateDistance } from "./GeolocationService";

const distance = calculateDistance(
  { latitude: 48.5734, longitude: 7.7521 },  // Strasbourg
  { latitude: 48.8566, longitude: 2.3522 }   // Paris
);
// Returns: 397.32 km
```

### Filtrage par rayon

```typescript
import { filterStoresByRadius } from "./GeolocationService";

const nearbyStores = filterStoresByRadius(
  allStores,
  userLocation,
  10 // km
);
// Returns: stores sorted by distance, within 10km
```

### Score prix + distance

```typescript
import { calculatePriceDistanceScore } from "./GeolocationService";

const score = calculatePriceDistanceScore(
  2.99,  // prix en €
  5.0,   // distance en km
  0.7    // pondération prix (70% prix, 30% distance)
);
// Returns: 2.84 (score normalisé, plus bas = meilleur)
```

## Intégration Overpass API (TODO)

Pour récupérer les coordonnées GPS des magasins depuis OpenStreetMap :

```typescript
// TODO: Créer un service pour enrichir automatiquement les magasins
async function enrichStoreCoordinates(storeName: string, location: string) {
  const query = `
    [out:json];
    node["shop"]["name"~"${storeName}"]["addr:city"~"${location}"];
    out body;
  `;
  
  const response = await fetch(
    "https://overpass-api.de/api/interpreter",
    { method: "POST", body: query }
  );
  
  const data = await response.json();
  // Extract lat/lon from data.elements[0]
}
```

## Migration des données existantes

Les magasins existants sans coordonnées GPS continueront à fonctionner (latitude/longitude optionnels). Pour enrichir progressivement :

1. **Manuel** : Ajouter latitude/longitude via l'interface d'admin
2. **Semi-auto** : Script de géocodage avec Overpass API
3. **Auto** : Géocodage à la création du magasin (via l'API Photon déjà utilisée)

## Prochaines étapes

### À court terme
- [ ] Ajouter géolocalisation utilisateur dans le profil
- [ ] Interface pour définir magasins favoris
- [ ] Interface pour définir rayon maximum
- [ ] Enrichir magasins existants avec coordonnées GPS

### À moyen terme
- [ ] Cache des calculs de distance (éviter recalculs)
- [ ] Historique des prix pour détection tendances
- [ ] Suggestions de courses "split" (acheter dans 2 magasins pour optimiser)
- [ ] Mode "trajet" : Optimiser selon un itinéraire

### À long terme
- [ ] Intégration avec APIs enseignes (horaires, stock temps réel)
- [ ] Crowdsourcing des prix manquants
- [ ] ML pour prédire les prix futurs
- [ ] Gamification : badges économies réalisées

## Performance

### Optimisations actuelles
- Calculs de distance mis en cache par le hook
- Sélection optimale calculée côté client (pas de surcharge serveur)
- Conversion d'unités optimisée (évite recalculs)

### Recommandations
- Limiter le nombre de magasins affichés (top 10 par distance)
- Pré-calculer les distances pour magasins fréquents
- Utiliser WebWorkers pour calculs intensifs (si >100 items)

## Tests

```bash
# Tests unitaires
yarn test GeolocationService
yarn test OptimalPricingService

# Tests d'intégration
yarn test useOptimalPricing
```

## Ressources

- [Formule de Haversine](https://en.wikipedia.org/wiki/Haversine_formula)
- [Overpass API](https://overpass-api.de/)
- [OpenStreetMap Wiki - Shop](https://wiki.openstreetmap.org/wiki/Key:shop)
