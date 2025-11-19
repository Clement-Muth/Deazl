# Système de Visibilité des Recettes

## Vue d'ensemble

Ce système implémente une gestion complète de la visibilité des recettes avec trois niveaux d'accès :

1. **PUBLIC** - Visible par tout le monde, indexé SEO, apparaît dans les hubs
2. **PRIVATE** - Visible uniquement par le propriétaire et les collaborateurs
3. **UNLISTED** - Accessible via token de partage uniquement, non indexé

## Architecture

### Domain Layer

#### Value Objects

- **`RecipeVisibility`** (`/Domain/ValueObjects/RecipeVisibility.vo.ts`)
  - Encapsule la logique de visibilité
  - Méthodes : `isPublic()`, `isPrivate()`, `isUnlisted()`, `isIndexableForSEO()`, etc.
  
- **`ShareToken`** (`/Domain/ValueObjects/ShareToken.vo.ts`)
  - Génération sécurisée de tokens de partage
  - Validation de format
  - Méthodes : `generate()`, `isValid()`, `equals()`

#### Entities

- **`Recipe`** - Enrichie avec méthodes de visibilité
  - `getVisibility()` : Retourne le RecipeVisibility
  - `canBeAccessedByAnonymous()` : Vérifie si accessible sans auth
  - `canBeAccessedWithToken()` : Vérifie un token de partage
  - `isVisibleInPublicHub()` : Détermine si visible dans hub public
  - `generateShareToken()` : Génère un token unlisted
  - `withVisibility()` : Change le mode de visibilité

#### Repository Interface

- **`RecipeRepository`** - Étendu avec méthodes publiques
  - `findByShareToken()` : Trouve via token
  - `findPublicRecipes()` : Filtre recettes publiques
  - `findTrendingPublicRecipes()` : Top tendances
  - `findRecentPublicRecipes()` : Nouvelles recettes
  - `checkUserAccess()` : Vérifie droits d'accès
  - `incrementViews()` : Compte les vues
  - `getPublicCategories()`, `getPublicCuisines()`, `getPopularTags()`

### Application Layer

#### Services

- **`RecipeAccessApplicationService`** (`/Application/Services/RecipeAccess.service.ts`)
  - Gère la logique d'accès aux recettes
  - `getRecipeWithAccessCheck()` : Vérifie et retourne recette avec mode d'accès
  - `canUserModifyRecipe()` : Vérifie droits de modification
  - `canUserViewRecipe()` : Vérifie droits de lecture
  
- **`PublicRecipeHubApplicationService`** (`/Application/Services/PublicRecipeHub.service.ts`)
  - Orchestration du hub public
  - `getPublicHubData()` : Données complètes du hub (tendances, nouvelles, catégories)
  - `getTrendingRecipes()`, `getRecentRecipes()`
  - `searchPublicRecipes()` : Recherche dans recettes publiques
  - `getPublicCategories()`, `getPublicCuisines()`, `getPopularTags()`

### Infrastructure Layer

- **`PrismaRecipeRepository`** - Implémentation complète
  - Toutes les méthodes du repository interface
  - Optimisations Prisma (index, includes, ordering)
  - Gestion des transactions

### API Layer (Server Actions)

#### Hub Public

- **`getPublicHubData.api.ts`**
  - `getPublicHubData()` : Hub complet
  - `getTrendingRecipes()` : Top tendances
  - `getRecentRecipes()` : Nouvelles recettes
  - `searchPublicRecipes()` : Recherche
  - `getPublicCategories()`, `getPublicCuisines()`, `getPopularTags()`

#### Accès Recettes

- **`getRecipeWithAccess.api.ts`**
  - `getRecipeWithAccess()` : Récupération avec vérification d'accès
  - `getRecipeByShareToken()` : Via token
  - `checkRecipeAccess()` : Vérification simple
  - `canUserModifyRecipe()` : Droits modification

### UI Layer

#### Components

##### Composants de restriction

- **`LoginCTA`** (`/Ui/components/LoginCTA.tsx`)
  - Bannière/CTA pour inviter à la connexion
  - 3 variants : `default`, `banner`, `inline`
  
- **`RestrictedActionButton`** (`/Ui/components/RestrictedActionButton.tsx`)
  - Bouton intelligent qui redirige vers login si non connecté
  - Exécute l'action si connecté
  
- **`PrivateRecipeBanner`** (`/Ui/components/PrivateRecipeBanner.tsx`)
  - Affichage élégant pour recettes privées
  - Message clair + CTA de connexion

##### Composants de hub

- **`PublicRecipeHub`** (`/Ui/PublicRecipeHub.tsx`)
  - Hub public complet
  - Sections : Tendances, Nouvelles, Catégories, Cuisines, Tags
  - CTA Login pour non-connectés
  - Recherche publique

#### Containers

- **`RecipeDetailsContainer`** - Adapté pour modes d'accès
  - Prop `accessMode` : `"public" | "authenticated" | "shared" | "restricted"`
  - Désactive actions selon mode (partage, ajout liste)
  - Gère affichage conditionnel des modales

### Routing

#### Pages

- **`/recipes/page.tsx`** - Hub adaptatif
  - Détecte authentification
  - Hub personnalisé si connecté
  - Hub public sinon
  
- **`/recipes/[id]/page.tsx`** - Détails avec contrôle d'accès
  - Support `?share=token` pour partage
  - Vérifie accès via `getRecipeWithAccess()`
  - Affiche `PrivateRecipeBanner` si bloqué
  
- **`/recipes/shared/[token]/page.tsx`** - Accès par token
  - Recette partagée par lien
  - Pas d'indexation SEO

## Flux d'utilisation

### Visiteur non connecté

1. Accède à `/recipes` → Voit hub public uniquement
2. Clique sur recette publique → Voit détails + prix moyens publics
3. Tente action (favoris, liste) → Redirigé vers login
4. Tente d'accéder recette privée → Voit `PrivateRecipeBanner`

### Utilisateur connecté

1. Accède à `/recipes` → Voit hub enrichi (recettes perso + publiques)
2. Clique sur recette → Voit détails + prix personnalisés
3. Peut ajouter favoris, listes, partager ses recettes
4. Accède à ses recettes privées + collaboratives

### Accès par lien partagé

1. Reçoit lien `/recipes/[id]?share=TOKEN`
2. Accède à la recette sans compte
3. Vue simplifiée (pas d'actions avancées)
4. Peut créer compte pour plus de fonctionnalités

## Pricing

Le système de prix (`RecipePricingService`) différencie automatiquement :

- **Mode public** (`computePublic()`) : Prix moyens nationaux, neutre
- **Mode user** (`computeForUser()`) : Prix optimisés selon localisation, magasins favoris, préférences

## Sécurité

✅ Vérification d'accès côté serveur systématique
✅ Tokens de partage cryptographiquement sécurisés
✅ Aucune exposition d'IDs/tokens dans listings publics
✅ Séparation stricte données publiques/privées
✅ Pas de SEO sur recettes unlisted

## Migration

Pour migrer vers ce système :

1. Les recettes existantes avec `isPublic: true` → PUBLIC
2. Les recettes avec `shareToken` → UNLISTED
3. Les autres → PRIVATE

## Usage

### Changer la visibilité d'une recette

```typescript
// Via entity
const recipe = await recipeRepository.findById(id);
const publicRecipe = recipe.withVisibility(RecipeVisibilityStatus.PUBLIC);
await recipeRepository.save(publicRecipe);

// Générer token de partage
const unlistedRecipe = recipe.generateShareToken();
```

### Vérifier l'accès

```typescript
// Côté serveur
const result = await getRecipeWithAccess(recipeId, shareToken);
if (!result.hasAccess) {
  return <PrivateRecipeBanner />;
}
```

### Afficher hub public

```typescript
const hubData = await getPublicHubData();
return <PublicRecipeHub hubData={hubData} isAuthenticated={false} />;
```

## Tests

Pour tester :

1. **Hub public** : Déconnecté → `/recipes`
2. **Hub connecté** : Connecté → `/recipes`
3. **Recette publique** : `/recipes/[public-id]`
4. **Recette privée** : `/recipes/[private-id]` (doit bloquer)
5. **Recette partagée** : `/recipes/[id]?share=TOKEN`
6. **Prix public vs perso** : Comparer connecté/déconnecté

## Évolutions futures

- [ ] Analytics sur vues/tendances
- [ ] Système de notation/commentaires publics
- [ ] Catégories personnalisées
- [ ] Recommandations AI publiques
- [ ] Flux RSS des nouvelles recettes
- [ ] Sitemap dynamique pour SEO
