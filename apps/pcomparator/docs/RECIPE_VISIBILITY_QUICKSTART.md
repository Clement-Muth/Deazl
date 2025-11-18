# Guide de Démarrage - Système de Recettes Publiques/Privées

## ✅ Implémentation Complète

Le système complet de gestion des recettes publiques, privées et partagées a été implémenté avec succès.

## 🎯 Fonctionnalités Implémentées

### 1. Trois Niveaux de Visibilité

- ✅ **PUBLIC** : Visible par tous, dans le hub, indexé SEO
- ✅ **PRIVATE** : Visible uniquement par propriétaire/collaborateurs
- ✅ **UNLISTED** : Accessible via lien de partage uniquement

### 2. Hub Public vs Hub Connecté

- ✅ **Hub Public** (`/recipes` non connecté)
  - Tendances publiques
  - Nouvelles recettes publiques
  - Catégories et cuisines
  - Tags populaires
  - CTA de connexion intelligent
  - Prix moyens (non personnalisés)

- ✅ **Hub Connecté** (`/recipes` connecté)
  - Hub existant enrichi
  - Recettes personnelles + publiques
  - Recommandations personnalisées
  - Prix optimisés
  - Cellier et favoris

### 3. Contrôle d'Accès

- ✅ Vérification serveur systématique
- ✅ Support `?share=token` pour partage
- ✅ Page "Recette privée" élégante
- ✅ Désactivation actions pour non-connectés

### 4. Pricing Différencié

- ✅ `computePublic()` : Prix moyens nationaux
- ✅ `computeForUser()` : Prix personnalisés (localisation, magasins)
- ✅ Intégré automatiquement dans les vues

### 5. Composants UI

- ✅ `LoginCTA` : 3 variants (banner, default, inline)
- ✅ `RestrictedActionButton` : Bouton intelligent
- ✅ `PrivateRecipeBanner` : Affichage bloqué
- ✅ `PublicRecipeHub` : Hub complet

## 🚀 Tester le Système

### 1. Hub Public (Non Connecté)

```bash
# Déconnectez-vous puis allez sur
http://localhost:3000/recipes
```

**Attendu :**
- Hub simplifié avec recettes publiques uniquement
- Bannière CTA pour créer un compte
- Pas de favoris/recommandations personnalisées
- Recherche limitée aux recettes publiques

### 2. Hub Connecté

```bash
# Connectez-vous puis allez sur
http://localhost:3000/recipes
```

**Attendu :**
- Hub enrichi avec toutes les fonctionnalités
- Recettes privées + publiques
- Actions complètes (favoris, listes, etc.)

### 3. Recette Publique

```bash
# Créez une recette avec isPublic = true
http://localhost:3000/recipes/[id]
```

**Attendu (non connecté) :**
- Affichage complet
- Prix moyens publics
- Actions désactivées (favoris, ajout liste)
- CTA pour se connecter

**Attendu (connecté) :**
- Affichage complet
- Prix personnalisés
- Toutes les actions disponibles

### 4. Recette Privée

```bash
# Créez une recette avec isPublic = false
http://localhost:3000/recipes/[id]
```

**Attendu (non connecté/non autorisé) :**
- Page "Recette privée"
- Message clair
- CTA de connexion

**Attendu (propriétaire/collaborateur) :**
- Accès complet

### 5. Partage par Lien

```bash
# Depuis une recette, générez un lien de partage
http://localhost:3000/recipes/[id]?share=TOKEN
```

**Attendu :**
- Accès sans compte
- Vue simplifiée
- Pas d'indexation SEO

## 📁 Fichiers Créés

### Domain Layer
```
/applications/Recipes/Domain/ValueObjects/
├── RecipeVisibility.vo.ts
└── ShareToken.vo.ts

/applications/Recipes/Domain/Entities/
└── Recipe.entity.ts (enrichi)

/applications/Recipes/Domain/Repositories/
└── RecipeRepository.ts (étendu)
```

### Application Layer
```
/applications/Recipes/Application/Services/
├── RecipeAccess.service.ts
└── PublicRecipeHub.service.ts
```

### Infrastructure Layer
```
/applications/Recipes/Infrastructure/Repositories/
└── PrismaRecipe.infrastructure.ts (étendu)
```

### API Layer
```
/applications/Recipes/Api/hub/
└── getPublicHubData.api.ts

/applications/Recipes/Api/recipes/
└── getRecipeWithAccess.api.ts
```

### UI Layer
```
/applications/Recipes/Ui/
├── PublicRecipeHub.tsx
├── RecipeDetailsContainer.tsx (adapté)
└── components/
    ├── LoginCTA.tsx
    ├── RestrictedActionButton.tsx
    └── PrivateRecipeBanner.tsx
```

### Pages
```
/app/[locale]/recipes/
├── page.tsx (adapté)
├── [id]/page.tsx (adapté)
└── shared/[token]/page.tsx (existant)
```

## 🔧 Configuration Base de Données

Le schema Prisma existant supporte déjà le système :
- `isPublic: Boolean`
- `shareToken: String?`
- Index sur `isPublic`

**Aucune migration nécessaire !**

## 📊 Données de Test

Pour tester efficacement, créez :

1. **Recettes publiques** (isPublic: true)
   - Minimum 10-15 pour peupler le hub
   - Variez catégories, cuisines, tags

2. **Recettes privées** (isPublic: false, shareToken: null)
   - Pour tester l'accès restreint

3. **Recettes partagées** (isPublic: false, shareToken: "xxx")
   - Pour tester l'accès par lien

## 🎨 Personnalisation

### Modifier les Sections du Hub Public

Éditez `/applications/Recipes/Application/Services/PublicRecipeHub.service.ts` :

```typescript
public async getPublicHubData(options?: {
  trendingLimit?: number;  // Défaut: 12
  recentLimit?: number;    // Défaut: 12
  tagsLimit?: number;      // Défaut: 20
})
```

### Adapter les CTAs

Modifiez `/applications/Recipes/Ui/components/LoginCTA.tsx` pour personnaliser :
- Messages
- Styles
- Boutons

## 🔐 Sécurité

Le système implémente :

✅ Vérification d'accès côté serveur
✅ Tokens de partage sécurisés (32+ bytes)
✅ Pas d'exposition de données privées
✅ SEO bloqué sur unlisted
✅ Séparation stricte public/privé

## 📈 Performance

Optimisations implémentées :

- Index Prisma sur `isPublic`
- Lazy loading des images
- Pagination dans recherche
- Cache potentiel (à implémenter)

## 🐛 Debugging

Si erreurs :

1. **Hub ne s'affiche pas** : Vérifiez `getPublicHubData()` logs
2. **Accès refusé** : Vérifiez `getRecipeWithAccess()` retour
3. **Prix incorrects** : Vérifiez mode (public/user) dans pricing

## 📝 Prochaines Étapes

Pour enrichir le système :

1. **Analytics** : Tracker vues, favoris, partages
2. **SEO** : Sitemap dynamique, meta tags
3. **Social** : Open Graph, Twitter Cards
4. **Notifs** : Alerter sur nouvelles recettes
5. **Cache** : Redis pour hub public
6. **CDN** : Images optimisées

## 🆘 Support

En cas de problème, référez-vous à :
- `/docs/RECIPE_VISIBILITY_SYSTEM.md` (documentation complète)
- Logs serveur dans terminal
- Errors TypeScript dans VS Code

---

**Système prêt à l'emploi !** 🎉
