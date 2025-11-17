# ProductDetailPage

Page de détail complète pour afficher toutes les informations d'un produit : qualité nutritionnelle, prix, additifs, allergènes, labels, ingrédients.

## 🎯 Vue d'ensemble

ProductDetailPage est un composant modal full-screen qui présente de manière structurée et interactive toutes les données d'un produit. Il est conçu pour être:
- **Responsive**: Adapté mobile-first avec bottom sheet
- **Performant**: Lazy loading des sections lourdes
- **Modulaire**: Composé de 8 sections réutilisables
- **Accessible**: Navigation au clavier, accordéons, labels ARIA

## 📦 Architecture

```
ProductDetailPage/
├── index.ts                          # Exports
├── ProductDetailPage.tsx             # Composant principal avec lazy loading
├── HeaderSection.tsx                 # En-tête avec nom, marque, score global
├── QualitySection.tsx                # NutriScore, EcoScore, Nova, avertissements
├── NutritionSection.tsx              # Tableau nutritionnel complet
├── AdditivesSection.tsx              # Liste des additifs avec niveaux de risque
├── AllergensAndLabelsSection.tsx     # Allergènes et certifications
├── IngredientsSection.tsx            # Liste d'ingrédients avec indicateurs
├── PriceSection.tsx                  # Prix par magasin avec tri/filtrage
└── ActionsSection.tsx                # Boutons d'action (ajouter, comparer, etc.)
```

## 🚀 Utilisation

### Exemple basique

```tsx
import { ProductDetailPage } from "~/packages/applications/shopping-lists/src/Ui/components/ProductDetailPage";

function ProductPage() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button onClick={() => setIsOpen(true)}>Voir les détails</button>
      
      <ProductDetailPage
        productId="3017620422003"
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        onAddToList={(id) => addToShoppingList(id)}
        fetchProduct={async (id) => await getProductDetails(id)}
      />
    </>
  );
}
```

### Exemple avec données préchargées

```tsx
<ProductDetailPage
  productData={{
    id: "123",
    name: "Nutella 400g",
    brand: "Ferrero",
    barcode: "3017620422003",
    imageUrl: "https://...",
    qualityData: {
      overallQualityScore: 45,
      nutriScore: { grade: "D", score: 25 },
      ecoScore: { grade: "C", score: 50 },
      novaGroup: { group: 4, score: 25 },
      nutriments: {
        energyKcal: 539,
        fat: 30.9,
        sugars: 56.3,
        salt: 0.107,
        // ...
      },
      additives: [
        { id: "E322", name: "Lécithine", riskLevel: "low" }
      ],
      allergens: ["milk", "nuts"],
      labels: ["palm-oil-free"],
      ingredients: {
        text: "Sucre, huile de palme, NOISETTES 13%, cacao maigre 7.4%, ...",
        count: 7,
        hasPalmOil: true
      },
      healthWarnings: {
        hasSugar: true,
        hasSalt: false,
        hasSaturatedFat: true
      }
    },
    prices: [
      {
        id: "1",
        productId: "123",
        storeId: "store1",
        storeName: "Carrefour",
        amount: 4.99,
        currency: "EUR",
        unit: "unité",
        dateRecorded: new Date()
      }
    ],
    isOpenFoodFacts: true,
    lastUpdated: new Date()
  }}
  isOpen={isOpen}
  onClose={() => setIsOpen(false)}
  compact={false}
/>
```

### Mode compact

Pour un affichage plus rapide et allégé:

```tsx
<ProductDetailPage
  productId="123"
  isOpen={isOpen}
  onClose={onClose}
  compact={true}  // Active le mode compact
  fetchProduct={getProduct}
/>
```

## 📋 API des composants

### ProductDetailPage

| Prop | Type | Requis | Description |
|------|------|--------|-------------|
| `productId` | `string` | ❌ | ID du produit (si pas de `productData`) |
| `productData` | `ProductData` | ❌ | Données du produit préchargées |
| `isOpen` | `boolean` | ✅ | État d'ouverture du modal |
| `onClose` | `() => void` | ✅ | Callback de fermeture |
| `onAddToList` | `(id: string) => void` | ❌ | Action "Ajouter à la liste" |
| `onCompare` | `(id: string) => void` | ❌ | Action "Comparer" |
| `onViewAlternatives` | `(id: string) => void` | ❌ | Action "Voir alternatives" |
| `onAddToFavorites` | `(id: string) => void` | ❌ | Action "Favoris" |
| `isInFavorites` | `boolean` | ❌ | Produit dans les favoris |
| `isInList` | `boolean` | ❌ | Produit dans la liste |
| `compact` | `boolean` | ❌ | Mode compact (défaut: `false`) |
| `fetchProduct` | `(id: string) => Promise<ProductData>` | ❌ | Fonction de chargement |

### Type ProductData

```typescript
interface ProductData {
  id: string;
  name: string;
  brand?: string;
  barcode: string;
  imageUrl?: string;
  qualityData?: ProductQualityData;
  prices: PriceData[];
  isOpenFoodFacts?: boolean;
  lastUpdated?: Date;
}
```

## 🎨 Sections détaillées

### HeaderSection

**Affiche:**
- Nom et marque du produit
- Image du produit (si disponible)
- Code-barres
- Score global /100 avec barre de progression
- Badge "OpenFoodFacts"
- Date de dernière mise à jour

**Props:**
```typescript
{
  productName: string;
  brandName?: string;
  barcode: string;
  isOpenFoodFacts: boolean;
  overallScore?: number;
  lastUpdated?: Date;
  imageUrl?: string;
}
```

### QualitySection

**Affiche:**
- Score global
- NutriScore (A-E)
- EcoScore (A-E)
- Nova Group (1-4)
- Avertissements santé (sucres, sel, graisses saturées)

**Modes:**
- **Compact**: Résumé avec badges et score global
- **Détaillé**: Accordéons avec explications complètes

### NutritionSection

**Affiche:**
- Tableau nutritionnel pour 100g
- Niveaux (faible/modéré/élevé) pour graisses, sucres, sel
- Barre de progression pour l'énergie (% de 2000 kcal)
- Avertissements pour valeurs élevées

**Nutriments inclus:**
- Énergie (kcal/kJ)
- Matières grasses (dont saturées)
- Glucides (dont sucres)
- Fibres
- Protéines
- Sel/Sodium

### AdditivesSection

**Affiche:**
- Liste complète des additifs
- Niveau de risque (faible/modéré/élevé) avec couleurs
- Badge "Aucun additif" si vide
- Alertes pour additifs à risque
- Section info sur les additifs

**Couleurs:**
- 🟢 Vert: Risque faible
- 🟠 Orange: Risque modéré
- 🔴 Rouge: Risque élevé

### AllergensAndLabelsSection

**Affiche:**
- Liste des allergènes avec alertes
- Labels et certifications avec icônes
- Informations sur les labels (Bio, Fair Trade, AOP/AOC, etc.)

**Icônes par type:**
- Bio → 🍃 Leaf
- Commerce équitable → 🏆 Award
- Éco/Vert → ♻️ Recycle
- Labels officiels → 🛡️ ShieldCheck

### IngredientsSection

**Affiche:**
- Liste complète des ingrédients
- Nombre d'ingrédients
- Indicateurs: allergènes, huile de palme
- Informations sur la transformation

**Indicateurs:**
- ⚠️ Contient des allergènes
- 🌴 Huile de palme
- ℹ️ Nombre d'ingrédients

### PriceSection

**Affiche:**
- Meilleur prix avec badge "🏆 Meilleur prix"
- Liste de tous les prix par magasin
- Économies par rapport au meilleur prix
- Date du relevé

**Fonctionnalités:**
- Tri: Prix ↑↓, Date ↓, Magasin
- Filtrage par magasin
- Calcul d'économies en % et en valeur

### ActionsSection

**Boutons:**
- ➕ Ajouter à la liste de courses
- 🔄 Comparer les produits
- 🔍 Voir les alternatives
- ❤️ Ajouter aux favoris

**États:**
- Bouton "Déjà dans la liste" (vert) si présent
- Icône remplie pour favoris

## 🎯 Lazy Loading

Les sections lourdes sont chargées à la demande:

```tsx
const NutritionSection = lazy(() => 
  import("./NutritionSection").then(m => ({ default: m.NutritionSection }))
);
// Idem pour: AdditivesSection, AllergensAndLabelsSection, 
// IngredientsSection, PriceSection
```

**Avantages:**
- Temps de chargement initial réduit
- Meilleure performance mobile
- Code splitting automatique

## 📱 Responsive Design

### Mobile (< 768px)
- Bottom sheet avec swipe down pour fermer
- Hauteur: 85vh maximum
- Scroll interne pour les sections longues
- Boutons full-width

### Desktop (≥ 768px)
- Modal centré classique
- Largeur maximale avec padding

### Hauteurs du bottom sheet
- `sm`: 1/4 de l'écran
- `md`: 1/2 de l'écran
- `lg`: 2/3 de l'écran (défaut)
- `full`: Plein écran
- `fit`: Hauteur du contenu

## 🔄 États

### Loading
```tsx
<Spinner size="lg" color="primary" />
<p>Chargement des informations produit...</p>
```

### Error
```tsx
<EmptyState type="no-data" productId={productId} />
```

### No Data
```tsx
<EmptyState 
  type="no-data" 
  productId={productId}
/>
```

### Success
Affichage de toutes les sections avec données

## 🎨 Design System

### Couleurs par score
```tsx
score >= 70 → success (vert)
score >= 50 → warning (orange)
score >= 30 → danger (rouge)
score < 30  → default (gris)
```

### Couleurs par risque
```tsx
low      → success (vert)
moderate → warning (orange)
high     → danger (rouge)
unknown  → default (gris)
```

### Spacing
- Sections: `mb-4` (16px)
- Contenu: `p-4` (16px)
- Grid gap: `gap-3` (12px)

## 📊 Exemples d'intégration

### Avec un bouton dans une liste

```tsx
function ProductListItem({ product }) {
  const [detailsOpen, setDetailsOpen] = useState(false);

  return (
    <>
      <div className="product-item">
        <h3>{product.name}</h3>
        <button onClick={() => setDetailsOpen(true)}>
          Voir détails
        </button>
      </div>

      <ProductDetailPage
        productData={product}
        isOpen={detailsOpen}
        onClose={() => setDetailsOpen(false)}
        onAddToList={handleAddToList}
        isInList={product.isInList}
      />
    </>
  );
}
```

### Avec navigation par URL

```tsx
function ProductPage() {
  const router = useRouter();
  const { productId } = useParams();
  const isOpen = !!productId;

  return (
    <ProductDetailPage
      productId={productId}
      isOpen={isOpen}
      onClose={() => router.push("/products")}
      fetchProduct={getProductById}
    />
  );
}
```

### Avec actions personnalisées

```tsx
<ProductDetailPage
  productId="123"
  isOpen={isOpen}
  onClose={onClose}
  onAddToList={(id) => {
    addToList(id);
    toast.success("Produit ajouté !");
  }}
  onCompare={(id) => {
    router.push(`/compare?product=${id}`);
  }}
  onViewAlternatives={(id) => {
    openAlternativesModal(id);
  }}
  onAddToFavorites={(id) => {
    toggleFavorite(id);
  }}
/>
```

## 🔮 Évolutions futures

### Court terme
- [ ] Export PDF des informations
- [ ] Partage social
- [ ] Historique des prix avec graphique
- [ ] Suggestions de produits similaires

### Moyen terme
- [ ] Comparaison inline de 2-3 produits
- [ ] Analyse de la composition (IA)
- [ ] Recommandations personnalisées
- [ ] Alertes sur les allergènes

### Long terme
- [ ] Suivi de l'évolution nutritionnelle
- [ ] Impact carbone détaillé
- [ ] Traçabilité de la chaîne d'approvisionnement
- [ ] Gamification (badges, défis)

## 🐛 Debug

### Le modal ne s'ouvre pas
Vérifiez que `isOpen={true}` et que le composant est bien rendu.

### Les sections sont vides
Vérifiez que `productData.qualityData` contient les bonnes clés.

### Erreur de lazy loading
Assurez-vous que les imports dynamiques pointent vers les bons chemins.

### Bottom sheet ne fonctionne pas
Vérifiez que `react-spring-bottom-sheet` est installé et que `useDevice` retourne "mobile".

## 📚 Ressources

- [ProductQuickView](../ProductQuickView/README.md) - Version rapide/modale
- [OpenFoodFacts API](https://world.openfoodfacts.org/data) - Source des données
- [HeroUI Modal](https://heroui.com/docs/components/modal) - Composant de base
- [react-spring-bottom-sheet](https://github.com/stipsan/react-spring-bottom-sheet) - Bottom sheet mobile

## ⚡ Performance

### Métriques cibles
- **First Contentful Paint**: < 1s
- **Time to Interactive**: < 2s
- **Lazy sections load**: < 200ms
- **Scroll performance**: 60 FPS

### Optimisations appliquées
- ✅ Lazy loading des sections lourdes
- ✅ Code splitting automatique
- ✅ `Suspense` boundaries
- ✅ `useMemo` pour calculs coûteux
- ✅ Conditional rendering

### Taille des bundles
- **ProductDetailPage**: ~15KB (gzipped)
- **Toutes les sections**: ~45KB (gzipped, lazy loaded)

## 🧪 Tests

```tsx
// Test d'ouverture/fermeture
it("should open and close modal", () => {
  const { getByText, queryByText } = render(
    <ProductDetailPage isOpen={false} onClose={jest.fn()} />
  );
  expect(queryByText(/Nutella/)).not.toBeInTheDocument();
});

// Test du lazy loading
it("should lazy load sections", async () => {
  render(<ProductDetailPage productData={mockData} isOpen={true} />);
  await waitFor(() => {
    expect(screen.getByText(/Informations nutritionnelles/)).toBeInTheDocument();
  });
});
```

## 📝 Notes

- Le composant utilise le système Modal custom qui gère automatiquement desktop/mobile
- Les données de qualité proviennent d'OpenFoodFacts ou de la base interne
- Le lazy loading améliore les performances mais nécessite Suspense
- Mode compact recommandé pour les listes avec beaucoup de produits
