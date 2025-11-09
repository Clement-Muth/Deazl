# Recipes Application - Ui Layer

Cette couche contient tous les composants UI de l'application recipes, organisés selon les principes DDD et Clean Architecture.

## Structure

```
Ui/
├── RecipesList.tsx                # Liste de toutes les recettes
├── RecipeDetails.tsx              # Détails d'une recette
├── RecipeForm/                    # Formulaires multi-étapes (création/édition)
│   ├── RecipeFormLayout.tsx
│   ├── RecipeBasicInfoStep.tsx
│   ├── RecipeIngredientsStep.tsx
│   ├── RecipeStepsStep.tsx
│   ├── RecipeFormNavigation.tsx
│   ├── RecipeFormCreate.tsx
│   ├── RecipeFormEdit.tsx
│   ├── README.md
│   └── index.ts
└── index.ts                       # Barrel export
```

## Responsabilités de la couche UI

La couche **Ui** dans Clean Architecture + DDD a pour responsabilités :

1. **Présentation des données** : Afficher les données du domaine à l'utilisateur
2. **Capture des interactions** : Capturer les actions utilisateur et les transmettre aux couches inférieures
3. **Validation de surface** : Validation basique des inputs (format, requis)
4. **Gestion de l'état UI** : État transitoire (loading, erreurs, modales)
5. **Responsive design** : Adaptation mobile-first

## Ce que la couche UI ne fait PAS

❌ **Business logic** : Pas de règles métier (ça va dans Domain)
❌ **Data fetching** : Pas d'appels API directs (ça va dans Api)
❌ **Data transformation** : Pas de transformation de données métier (ça va dans Application)
❌ **State persistence** : Pas de gestion de cache/storage (ça va dans Infrastructure)

## Principes appliqués

### 1. Single Responsibility Principle (SRP)
Chaque composant a **une seule responsabilité** :
- `RecipesList` : Afficher une liste
- `RecipeDetails` : Afficher les détails
- `RecipeFormCreate` : Orchestrer la création
- `RecipeBasicInfoStep` : Afficher le step 1

### 2. Dependency Inversion Principle (DIP)
Les composants UI **dépendent d'abstractions** (props/interfaces), pas d'implémentations :
```tsx
interface RecipeFormEditProps {
  recipe: RecipePayload; // Abstraction du domaine
}
```

### 3. Open/Closed Principle (OCP)
Les composants sont **ouverts à l'extension, fermés à la modification** :
- Ajout de steps facile via composition
- Pas besoin de modifier RecipeFormLayout pour ajouter un step

### 4. Interface Segregation Principle (ISP)
Chaque composant reçoit **uniquement ce dont il a besoin** :
```tsx
// ❌ Mauvais : passer tout l'objet
<RecipeIngredientsStep formData={formData} />

// ✅ Bon : passer uniquement les ingrédients
<RecipeIngredientsStep 
  ingredients={formData.ingredients} 
  onAddIngredient={addIngredient}
/>
```

## Flow de données

```
┌─────────────┐
│   Page      │ (Next.js App Router)
│  (RSC)      │
└──────┬──────┘
       │
       │ props
       ▼
┌─────────────┐
│   Ui/       │ (Client Components)
│ Components  │
└──────┬──────┘
       │
       │ actions
       ▼
┌─────────────┐
│    Api/     │ (Server Actions)
└──────┬──────┘
       │
       ▼
┌─────────────┐
│ Application │ (Services)
└──────┬──────┘
       │
       ▼
┌─────────────┐
│  Domain     │ (Entities, Rules)
└──────┬──────┘
       │
       ▼
┌─────────────┐
│Infrastructure│ (Prisma, APIs)
└─────────────┘
```

## État du formulaire (Form State)

### Approche actuelle : useState local
✅ **Avantages** :
- Simple et direct
- Pas de dépendances externes
- Parfait pour des formulaires simples

⚠️ **Limitations** :
- State perdu lors du démontage
- Pas de persistance entre refreshes
- Validation manuelle

### Alternative future : React Hook Form
Si le formulaire devient plus complexe :
```tsx
const { register, handleSubmit } = useForm<CreateRecipePayload>();
```

## Animations

Tous les composants de listing/détails utilisent **Framer Motion** :
- Transitions entre pages
- Stagger animations pour les listes
- Spring animations pour les interactions

Configuration standard :
```tsx
<motion.div
  initial={{ opacity: 0, x: 20 }}
  animate={{ opacity: 1, x: 0 }}
  exit={{ opacity: 0, x: -20 }}
  transition={{ duration: 0.3 }}
/>
```

## Responsive Design

### Breakpoints Tailwind
- `sm:` 640px (mobile landscape, petit tablet)
- `md:` 768px (tablet)
- `lg:` 1024px (laptop)
- `xl:` 1280px (desktop)

### Patterns récurrents
```tsx
// Padding responsive
className="p-4 sm:p-6"

// Text size responsive
className="text-lg sm:text-xl md:text-2xl"

// Layout responsive
className="flex-col sm:flex-row"

// Grid responsive
className="grid-cols-1 sm:grid-cols-2 lg:grid-cols-3"
```

## Internationalisation (i18n)

Utilise **@lingui/macro** pour toutes les strings :

```tsx
import { Trans } from "@lingui/react/macro";
import { useLingui } from "@lingui/react/macro";

// Pour les JSX
<Trans>Créer une recette</Trans>

// Pour les strings
const { t } = useLingui();
const placeholder = t`Entrez un nom`;
```

## Accessibilité (a11y)

Tous les composants respectent les standards WCAG 2.1 AA :
- Labels sur tous les inputs
- ARIA labels sur les boutons icône
- Navigation au clavier
- Contrastes suffisants
- Responsive touch targets (44x44px minimum)

## Tests

### Structure des tests
```
RecipeForm/
├── RecipeFormCreate.spec.tsx
├── RecipeFormEdit.spec.tsx
├── RecipeBasicInfoStep.spec.tsx
└── ...
```

### Stratégie de tests
1. **Unit tests** : Chaque composant isolé
2. **Integration tests** : Flow complet du formulaire
3. **E2E tests** : Parcours utilisateur complet (Playwright)

## Export et réutilisation

### Barrel exports
Toujours utiliser les barrel exports :
```tsx
// ✅ Bon
import { RecipeFormCreate } from "~/packages/applications/recipes/src/Ui";

// ❌ Mauvais (bypass l'abstraction)
import RecipeFormCreate from "~/packages/applications/recipes/src/Ui/RecipeForm/RecipeFormCreate";
```

### Réutilisation
Les steps peuvent être réutilisés dans d'autres contextes :
```tsx
// Exemple: wizard de duplication de recette
<RecipeBasicInfoStep 
  formData={duplicatedRecipe}
  onFormDataChange={updateDuplicate}
/>
```

## Performance

### Code splitting
Next.js fait du code splitting automatique par route :
- `/recipes/new` → charge uniquement RecipeFormCreate
- `/recipes/[id]/edit` → charge uniquement RecipeFormEdit

### Lazy loading
Pour des composants lourds :
```tsx
const RecipeImageEditor = lazy(() => import("./RecipeImageEditor"));
```

### Memoization
Utiliser React.memo pour les composants purs :
```tsx
export const RecipeCard = React.memo(({ recipe }) => {
  // ...
});
```

## Convention de nommage

### Composants
- PascalCase : `RecipeFormCreate`
- Suffixe descriptif : `RecipeBasicInfoStep` (pas juste `BasicInfo`)

### Props
- camelCase : `onFormDataChange`, `imagePreview`
- Préfixes handlers : `on*`, `handle*`

### Types
- PascalCase + Props suffix : `RecipeFormEditProps`
- Export avec le composant associé

## Migration depuis les anciennes pages

### Avant (anti-pattern)
```tsx
// 600 lignes dans un seul fichier content.tsx
export const NewRecipeContent = () => {
  // Toute la logique mélangée
};
```

### Après (SRP appliqué)
```tsx
// 3 lignes dans content.tsx
import { RecipeFormCreate } from "~/packages/applications/recipes/src/Ui";
export const NewRecipeContent = RecipeFormCreate;
```

Les 600 lignes sont maintenant réparties en **7 fichiers** de ~80-150 lignes chacun.
