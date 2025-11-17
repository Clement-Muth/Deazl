# ProductQuickView - Système de visualisation et comparaison de produits

## 📋 Vue d'ensemble

Le système `ProductQuickView` offre une expérience utilisateur complète pour visualiser, comparer et sélectionner des produits dans l'application Deazl. Il se compose de plusieurs composants React et services backend.

## 🏗️ Architecture

### Services Backend (Server Actions)

#### `getProductWithPricesAndQuality.api.ts`
Récupère un produit avec toutes ses données :
- Informations de base (nom, barcode, marque, catégorie)
- Données de qualité (NutriScore, EcoScore, NovaGroup)
- Liste des prix par magasin
- Métadonnées (dates, source)

```typescript
const result = await getProductWithPricesAndQuality(productId);
// result.product contient toutes les données
```

#### `getSimilarProducts.api.ts`
Trouve des produits similaires pour comparaison :
- Recherche par catégorie, marque ou nom similaire
- Retourne jusqu'à 5 produits similaires
- Inclut prix moyen, prix le plus bas, nombre de magasins

```typescript
const result = await getSimilarProducts(productId, limit);
// result.products contient les produits similaires
```

### Composants UI

#### `ProductQuickView.tsx` (Composant principal)
Modal bottom sheet affichant les détails du produit :
- **Props** :
  - `productId`: ID du produit à afficher
  - `isOpen`: État d'ouverture du modal
  - `onClose`: Callback de fermeture
  - `onSelectProduct`: Callback optionnel de sélection

**Sections** :
1. En-tête : Nom, marque, badges (OpenFoodFacts)
2. Qualité : Scores nutritionnels et environnementaux
3. Prix : Liste des prix par magasin
4. Actions : Voir fiche complète, sélectionner, fermer

#### `ProductQualityBadges.tsx`
Affiche les badges de qualité :
- NutriScore (A-E) avec code couleur
- EcoScore (A-E) avec code couleur
- Nova Group (1-4) avec code couleur
- Score global /100
- Explications pour chaque métrique

#### `ProductPriceList.tsx`
Liste des prix triée du moins cher au plus cher :
- Badge "🏆 Meilleur prix" sur le plus bas
- Nom du magasin + localisation
- Prix + unité
- Date de relevé (formatage relatif)

#### `ProductComparison.tsx`
Modal de comparaison intelligente :
- Compare le produit actuel avec produits similaires
- 3 modes de comparaison :
  - **Équilibré** : balance tous les critères (40% prix, 30% qualité, 30% disponibilité)
  - **Qualité prioritaire** : privilégie qualité (20% prix, 60% qualité, 20% disponibilité)
  - **Prix prioritaire** : privilégie prix (70% prix, 20% qualité, 10% disponibilité)
- Affiche le produit recommandé avec score
- Liste tous les produits comparés avec métriques

## 🎨 Design System

### Composants HeroUI utilisés
- `Modal` : conteneur principal (placement="bottom", size="full")
- `Card` : cartes pour prix et comparaisons
- `Chip` : badges de qualité et statut
- `Button` : actions principales
- `RadioGroup` : sélection mode de comparaison
- `Spinner` : états de chargement

### Icônes Lucide React
- `PackageIcon` : produit
- `StoreIcon` : magasins
- `BarChart3Icon` : qualité
- `TrophyIcon` : meilleur prix
- `LeafIcon` : scores environnementaux
- `DollarSignIcon` : prix
- `AwardIcon` : recommandation

### Couleurs
- **Success** (vert) : A, B, scores ≥70
- **Warning** (orange) : C, Nova 3, scores 40-69
- **Danger** (rouge) : D, E, Nova 4, scores <40
- **Primary** (bleu) : actions principales
- **Default** (gris) : éléments neutres

## 💡 Utilisation

### Intégration basique

```tsx
import { ProductQuickView } from "~/packages/applications/shopping-lists/src/Ui/components/ProductQuickView";

function MyComponent() {
  const [isOpen, setIsOpen] = useState(false);
  const [productId, setProductId] = useState<string | null>(null);

  return (
    <>
      <button onClick={() => {
        setProductId("product-id");
        setIsOpen(true);
      }}>
        Voir le produit
      </button>

      {productId && (
        <ProductQuickView
          productId={productId}
          isOpen={isOpen}
          onClose={() => setIsOpen(false)}
          onSelectProduct={(id) => {
            console.log("Produit sélectionné:", id);
            setIsOpen(false);
          }}
        />
      )}
    </>
  );
}
```

### Intégration dans ShoppingListItemList

Voir `INTEGRATION_EXAMPLE.ts` pour un exemple complet d'intégration dans la liste de courses.

## 🔍 Algorithme de comparaison

Le système utilise un algorithme de scoring pondéré :

```typescript
score = (priceScore × prixWeight) + 
        (qualityScore × qualityWeight) + 
        (availabilityScore × availabilityWeight)
```

### Calculs
- **Prix** : normalisé inversé (moins cher = meilleur)
- **Qualité** : score global 0-100 depuis ProductQualityData
- **Disponibilité** : nombre de magasins × 25 (4 magasins = 100)

### Modes
- **Balanced** : 40/30/30
- **Quality** : 20/60/20
- **Price** : 70/20/10

## 📱 Responsive & UX

### Mobile First
- Bottom sheet natif (placement="bottom")
- Scroll interne si contenu dépasse
- Swipe down pour fermer
- Animations fluides

### États
- **Loading** : Spinner pendant chargement
- **Error** : Message d'erreur si échec
- **Empty** : Message si pas de données
- **Success** : Affichage complet

### Performance
- Chargement lazy des données similaires
- Cache côté client possible
- Optimisation des requêtes Prisma

## 🚀 Évolutions futures

### Court terme
- [ ] Graphique d'évolution des prix
- [ ] Historique complet des prix
- [ ] Filtrage des magasins dans comparaison
- [ ] Export/partage de comparaison

### Moyen terme
- [ ] Page `/products/[id]` complète
- [ ] Alertes prix
- [ ] Favoris/Watchlist
- [ ] Suggestions de substitution

### Long terme
- [ ] IA pour recommandations personnalisées
- [ ] Analyse nutritionnelle avancée
- [ ] Traçabilité complète
- [ ] Impact carbone détaillé

## 📝 Notes techniques

### Données OpenFoodFacts
Les produits issus d'OpenFoodFacts ont :
- `isOpenFoodFacts: true`
- Barcode ne commence pas par "MANUAL-"
- Données qualité enrichies automatiquement

### Gestion des erreurs
Tous les services retournent :
```typescript
{ success: boolean, error?: string, data?: T }
```

### Types TypeScript
Tous les types sont exportés depuis les composants/services pour réutilisation.

## 🤝 Contribution

Pour ajouter une nouvelle section au ProductQuickView :
1. Créer un nouveau composant dans `ProductQuickView/`
2. L'importer dans `ProductQuickView.tsx`
3. L'ajouter avec une section `<section>` et `<Divider />`
4. Mettre à jour ce README

## 📚 Références

- [HeroUI Documentation](https://heroui.com)
- [Lucide Icons](https://lucide.dev)
- [OpenFoodFacts API](https://world.openfoodfacts.org/data)
- [Prisma Documentation](https://www.prisma.io/docs)
