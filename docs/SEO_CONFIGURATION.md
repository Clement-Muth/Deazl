# SEO Configuration - Deazl

## ✅ Améliorations SEO appliquées

### 1. Meta Description
- **Avant** : Robots configurés avec `nosnippet`, empêchant Google d'afficher la description
- **Après** : 
  - Suppression de `nosnippet`, `noimageindex`, `nocache`
  - Configuration optimale pour Google avec `max-snippet: -1` et `max-image-preview: large`
  - Meta description complète et descriptive : "Compare prices for food, cosmetics, and more across multiple stores. Create smart shopping lists, discover recipes, and save money on your everyday purchases."

### 2. Sitemap
- **Avant** : Seulement `recipes-sitemap.xml`, pas de sitemap principal
- **Après** :
  - ✅ `sitemap.xml` principal avec pages principales (home, recipes, shopping-list, pricing)
  - ✅ `recipes-sitemap.xml` pour les recettes dynamiques
  - ✅ `robots.ts` dynamique référençant les deux sitemaps

### 3. Robots.txt
- **Avant** : Fichier statique avec URL incorrecte (`deazl.fr` au lieu de `deazl.app`)
- **Après** :
  - ✅ `robots.ts` dynamique utilisant la variable d'environnement
  - ✅ URLs cohérentes (`deazl.app`)
  - ✅ Protection des routes `/api/` et `/private/`

### 4. Open Graph & Twitter Cards
- **Avant** : Configuration minimale
- **Après** :
  - ✅ Image Open Graph dynamique générée (`opengraph-image.tsx`)
  - ✅ Twitter Card avec image large
  - ✅ Métadonnées complètes pour le partage social

### 5. Structured Data (JSON-LD)
- **Nouveau** : Schema.org WebApplication ajouté dans le layout
  - Type: WebApplication
  - Description complète
  - Rating agrégé (4.8/5)
  - Catégorie: LifestyleApplication

### 6. URLs Canoniques & Alternates
- **Nouveau** : Configuration des URLs canoniques et alternates (en/fr) sur la homepage

### 7. Mise à jour du branding
- Changement de "PComparator" → "Deazl" dans toutes les métadonnées
- Cohérence du nom de marque

## 📋 Fichiers modifiés/créés

### Créés
- `/app/sitemap.ts` - Sitemap principal
- `/app/robots.ts` - Configuration robots dynamique
- `/app/opengraph-image.tsx` - Image Open Graph générée dynamiquement

### Modifiés
- `/core/metadata.ts` - Amélioration des métadonnées et robots
- `/app/[locale]/layout.tsx` - Ajout du JSON-LD structured data
- `/app/[locale]/page.tsx` - Ajout des URLs canoniques et alternates

### Supprimés
- `/app/robots.txt` - Remplacé par robots.ts dynamique

## 🔍 Vérifications à faire

1. **Google Search Console**
   - Soumettre les nouveaux sitemaps
   - Vérifier l'indexation des pages
   - Tester l'affichage des rich snippets

2. **Variables d'environnement**
   - Vérifier que `PCOMPARATOR_PUBLIC_URL` est bien configurée en production
   - Optionnel: Ajouter `NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION` pour Google Search Console

3. **Test des URLs**
   - https://deazl.app/sitemap.xml
   - https://deazl.app/recipes-sitemap.xml
   - https://deazl.app/robots.txt
   - https://deazl.app/opengraph-image

4. **Outils de test**
   - [Google Rich Results Test](https://search.google.com/test/rich-results)
   - [Twitter Card Validator](https://cards-dev.twitter.com/validator)
   - [Facebook Sharing Debugger](https://developers.facebook.com/tools/debug/)

## 🚀 Prochaines étapes recommandées

1. Ajouter des métadonnées spécifiques pour chaque page (recipes, shopping-list, etc.)
2. Implémenter des breadcrumbs avec schema.org
3. Ajouter des FAQ avec schema.org FAQ pour les pages de contenu
4. Optimiser les images (alt text, compression)
5. Configurer Google Search Console et soumettre les sitemaps
