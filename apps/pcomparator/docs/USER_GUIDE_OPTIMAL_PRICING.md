# Guide d'utilisation - Optimisation intelligente des prix

Ce guide explique comment configurer et utiliser le système d'optimisation intelligente des prix dans vos listes de courses.

## Table des matières

1. [Vue d'ensemble](#vue-densemble)
2. [Configuration initiale](#configuration-initiale)
3. [Préférences d'optimisation](#préférences-doptimisation)
4. [Magasins favoris](#magasins-favoris)
5. [Enrichissement GPS des magasins](#enrichissement-gps-des-magasins)
6. [Utilisation dans les listes de courses](#utilisation-dans-les-listes-de-courses)

---

## Vue d'ensemble

Le système d'optimisation intelligente sélectionne automatiquement les meilleurs prix pour vos listes de courses en tenant compte de :

- **Prix** : Coût du produit
- **Distance** : Proximité du magasin (si géolocalisation activée)
- **Préférences** : Vos magasins favoris
- **Disponibilité** : Magasins dans votre rayon maximum

### Scénarios de sélection

Le système choisit automatiquement le meilleur prix selon 4 scénarios :

1. **Magasin sélectionné** : Si vous avez sélectionné un magasin spécifique dans la liste
2. **Magasin favori** : Si le produit est disponible dans vos magasins favoris
3. **Meilleur prix** : Si aucune géolocalisation n'est configurée
4. **Meilleur prix + distance** : Combinaison optimale prix/proximité (si géolocalisé)

---

## Configuration initiale

### Étape 1 : Activer la géolocalisation

1. Allez dans **Paramètres** (`/settings`)
2. Section **Shopping Optimization**
3. Cliquez sur **Configure**
4. Cliquez sur **Enable** dans la section Geolocation
5. Autorisez votre navigateur à accéder à votre position

> **Note** : La géolocalisation est optionnelle mais recommandée pour l'optimisation distance.

### Étape 2 : Configurer le rayon maximum

Dans le même modal :

1. Ajustez le slider **Maximum radius**
2. Plage : 1-50 km (défaut : 10 km)
3. Seuls les magasins dans ce rayon seront considérés

### Étape 3 : Ajuster la pondération prix/distance

1. Utilisez le slider **Price vs Distance priority**
2. **100% Prix** : Toujours le prix le plus bas, peu importe la distance
3. **50/50 Balanced** : Équilibre entre prix et proximité
4. **100% Distance** : Privilégie la proximité, même si plus cher

> **Calcul** : Distance coûte 0,50€/km dans le score combiné

---

## Préférences d'optimisation

### Accès aux préférences

**Page Settings** → Section **Shopping Optimization** → Bouton **Configure**

### État actuel

Le récapitulatif affiche :

- ✅ **Geolocation** : Active / Not configured
- 📍 **Max radius** : Distance en km
- ⚖️ **Price weight** : Pourcentage de priorité prix

### Sauvegarder les modifications

1. Ajustez vos préférences
2. Cliquez sur **Save**
3. Toast de confirmation
4. Les nouvelles préférences s'appliquent immédiatement

---

## Magasins favoris

### Pourquoi définir des favoris ?

Les magasins favoris sont **prioritaires** dans la sélection des prix, même si un autre magasin propose un prix légèrement inférieur.

### Configuration

**Page Settings** → Section **Shopping Optimization** → **Favorite Stores** → **Manage**

### Ajouter/Retirer des favoris

1. Cliquez sur un magasin pour le marquer comme favori ⭐
2. Les favoris apparaissent avec un fond bleu
3. Cliquez à nouveau pour retirer des favoris
4. **Save** pour enregistrer

### Affichage

Les magasins favoris sélectionnés sont affichés sous forme de **chips** dans la section Settings.

---

## Enrichissement GPS des magasins

### Pourquoi enrichir les magasins ?

Pour que l'optimisation distance fonctionne, les magasins doivent avoir des coordonnées GPS.

### Enrichissement automatique

**Tous les nouveaux magasins** créés sont automatiquement géocodés via l'API Photon (Komoot).

### Enrichir les magasins existants

#### Option 1 : Page d'administration

1. Allez sur `/admin/stores`
2. Vous verrez la liste des magasins **sans coordonnées**
3. **Enrich** : Géocoder un seul magasin
4. **Enrich All** : Traiter tous les magasins en batch

#### Statistiques affichées

- **Without coordinates** : Nombre de magasins à enrichir
- **In progress** : Enrichissements en cours
- **Total prices** : Nombre de prix concernés

#### Option 2 : Automatique via API

Lors de la création d'un magasin via `createStore.api.ts` :

```typescript
const newStore = await createStore({
  name: "Carrefour",
  location: "Paris, France"
  // latitude/longitude ajoutés automatiquement
});
```

### Géocodage Photon API

- **API** : https://photon.komoot.io
- **Gratuit** : Pas de clé API nécessaire
- **Rate limit** : 500ms entre chaque requête (batch)
- **Format** : `"Nom du magasin, Ville, Pays"`

### Logs

Les enrichissements sont loggés dans la console serveur :

```
[GPS Enrichment] Carrefour @ Paris, France: { latitude: 48.8566, longitude: 2.3522 }
✓ Enriched: Carrefour @ Paris, France
✗ Failed: Magasin Inconnu @ Ville Inconnue
```

---

## Utilisation dans les listes de courses

### Affichage des prix optimaux

Chaque produit dans votre liste affiche :

1. **Prix sélectionné** : Le prix optimal selon vos préférences
2. **Raison de sélection** :
   - 🎯 **user_selected_store** : Magasin choisi manuellement
   - ⭐ **favorite_store** : Disponible dans vos favoris
   - 💰 **best_price** : Prix le plus bas (sans distance)
   - 📍 **best_price_distance** : Meilleur rapport prix/distance

### Distance affichée

Si géolocalisation active :
- **📍 2.3 km** : Distance à vol d'oiseau depuis votre position

### Suggestions d'économies

Si activé (`showSavingSuggestions: true`), le système affiche :

> **💡 Économisez 0,50€** en allant chez Carrefour (3.5 km)

### Récapitulatif par magasin

En bas de la liste :

```
📍 Magasin A : 5 articles - 12,50€
📍 Magasin B : 3 articles - 8,30€
---
💰 Total : 20,80€
💡 Économies potentielles : 2,40€
```

### Sélection manuelle de magasin

Pour forcer un magasin spécifique :

1. Cliquez sur le bouton **Store** en haut de la liste
2. Choisissez le magasin désiré
3. Tous les prix se mettent à jour pour ce magasin

---

## Architecture technique

### Services

- **GeolocationService** : Calcul des distances (Haversine), filtrage par rayon, scoring
- **OptimalPricingService** : Logique de sélection des prix, 4 scénarios
- **useOptimalPricing** : Hook React intégrant le service
- **useUserOptimizationPreferences** : Hook pour charger les préférences utilisateur

### APIs

- **optimizationPreferences.api.ts** : CRUD des préférences utilisateur
- **geocodeStore.api.ts** : Géocodage via Photon API
- **enrichStores.api.ts** : Enrichissement batch/single des magasins
- **getStores.api.ts** : Liste des magasins avec coordonnées

### Composants UI

- **SettingsOptimalPricing** : Configuration des préférences (géoloc, rayon, pondération)
- **SettingsFavoriteStores** : Gestion des magasins favoris
- **StoreEnrichmentPanel** : Administration des coordonnées GPS
- **PriceSuggestion** : Affichage prix + distance + suggestions
- **TotalCostSummary** : Récapitulatif par magasin

---

## FAQ

### Les prix changent sans que je fasse rien ?

C'est normal ! Le système recalcule automatiquement les meilleurs prix quand :
- Vous modifiez vos préférences
- Vous vous déplacez (nouvelle géolocalisation)
- De nouveaux prix sont ajoutés

### Pourquoi certains magasins ne sont pas proposés ?

Vérifiez :
1. Le magasin a-t-il des coordonnées GPS ? (`/admin/stores`)
2. Est-il dans votre rayon maximum ? (Settings)
3. A-t-il des prix pour ce produit ?

### Comment désactiver les suggestions d'économies ?

Actuellement, `showSavingSuggestions` est toujours `true`. Pour désactiver :
1. Modifier le code dans `SettingsOptimalPricing.tsx`
2. Ajouter un toggle dans le modal
3. Sauvegarder dans `User.optimizationPreferences`

### L'enrichissement GPS échoue, pourquoi ?

Causes possibles :
- Adresse trop imprécise ("Magasin, Ville")
- Nom de ville incorrect
- Rate limit Photon API dépassé

Solution : Ajouter manuellement les coordonnées dans la base de données.

---

## Exemples d'utilisation

### Cas 1 : Courses hebdomadaires optimisées

**Profil** : Marie, Paris 15e, préfère Carrefour et Monoprix

**Configuration** :
- Géolocalisation : ✅ Activée
- Rayon : 3 km
- Pondération : 70% prix / 30% distance
- Favoris : Carrefour, Monoprix

**Résultat** : 
- 80% des prix viennent de Carrefour/Monoprix
- Économies moyennes : 15% vs meilleur prix absolu
- Temps de trajet : -40% vs tous magasins

### Cas 2 : Chercheur de bonnes affaires

**Profil** : Thomas, Marseille, veut toujours le prix le plus bas

**Configuration** :
- Géolocalisation : ❌ Désactivée
- Pondération : 100% prix
- Favoris : Aucun

**Résultat** :
- Toujours le prix le plus bas affiché
- Peut nécessiter d'aller dans 5+ magasins différents
- Économies maximales

### Cas 3 : Proximité avant tout

**Profil** : Sophie, Lyon, sans voiture

**Configuration** :
- Géolocalisation : ✅ Activée
- Rayon : 1 km
- Pondération : 20% prix / 80% distance
- Favoris : Franprix à 500m

**Résultat** :
- 95% des prix du Franprix local
- Surcoût moyen : +8% vs meilleur prix
- Temps de trajet : 10 min à pied

---

## Dépannage

### Erreur "Unable to detect your position"

1. Vérifiez les permissions du navigateur
2. Essayez en HTTPS (requis pour geolocation)
3. Réessayez après avoir autorisé

### Les préférences ne se sauvent pas

1. Vérifiez la console pour les erreurs
2. Testez l'API : `getUserOptimizationPreferences()`
3. Vérifiez que `User.optimizationPreferences` accepte JsonB

### Aucun prix affiché

1. Les produits ont-ils des prix associés ?
2. Les magasins sont-ils dans votre rayon ?
3. Désactivez temporairement le filtre distance

---

## Ressources

- **Documentation technique** : `OPTIMAL_PRICING.md`
- **Architecture DDD** : `.github/copilot-instructions.md`
- **Code source** :
  - Services : `src/packages/applications/shopping-lists/src/Domain/Services/`
  - UI : `src/packages/applications/shopping-lists/src/Ui/`
  - APIs : `src/packages/applications/shopping-lists/src/Api/`

---

**Version** : 1.0.0  
**Dernière mise à jour** : 2024-01-13
