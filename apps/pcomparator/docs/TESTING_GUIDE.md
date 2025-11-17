# Guide de test - Système d'optimisation des prix

Ce document détaille comment tester toutes les fonctionnalités du système d'optimisation intelligente des prix.

---

## Prérequis

### Base de données
```bash
# Vérifier que la migration est appliquée
cd apps/pcomparator
yarn prisma migrate status

# Si nécessaire, appliquer la migration
yarn prisma migrate deploy
```

### Données de test

Créer au moins :
- 1 utilisateur avec email vérifié
- 3 magasins avec coordonnées GPS différentes :
  - Magasin A : Paris centre (48.8566, 2.3522)
  - Magasin B : Paris 15e (48.8414, 2.2887)
  - Magasin C : Boulogne (48.8353, 2.2402)
- 5 produits avec codes-barres valides
- 3 prix différents par produit (un par magasin)

---

## Test 1 : Configuration des préférences

### Objectif
Vérifier que l'utilisateur peut configurer ses préférences d'optimisation.

### Étapes

1. **Se connecter** à l'application
2. **Naviguer** vers `/settings`
3. **Localiser** la section "Shopping Optimization"
4. **Cliquer** sur le bouton "Configure"

### Test 1.1 : Géolocalisation

**Vérifications** :
- [ ] Modal s'ouvre correctement
- [ ] Section "Geolocation" visible avec bouton "Enable"
- [ ] Cliquer "Enable" → navigateur demande permission
- [ ] Autoriser → coordonnées affichées
- [ ] Format : `Position: 48.xxxx, 2.xxxx`
- [ ] Chip "Active" apparaît
- [ ] Cliquer "Save" → toast de confirmation

**Cas d'erreur** :
- [ ] Refuser permission → message d'erreur approprié
- [ ] Tester en HTTP (dev) → geolocation fonctionne quand même
- [ ] Tester en HTTPS → geolocation requise

### Test 1.2 : Rayon maximum

**Vérifications** :
- [ ] Slider visible avec valeurs 1-50 km
- [ ] Valeur par défaut : 10 km
- [ ] Déplacer le slider → valeur se met à jour
- [ ] Label affiche "X km"
- [ ] Sauvegarder → toast de confirmation

**Test des limites** :
- [ ] Minimum : 1 km
- [ ] Maximum : 50 km
- [ ] Valeur intermédiaire : 25 km

### Test 1.3 : Pondération prix/distance

**Vérifications** :
- [ ] Slider visible avec valeurs 0-100%
- [ ] Valeur par défaut : 70% (prix) / 30% (distance)
- [ ] Déplacer slider → label change :
  - [ ] >80% : "💰 Price priority"
  - [ ] <30% : "📍 Distance priority"
  - [ ] 30-80% : "⚖️ Balanced"
- [ ] Pourcentages affichés : "Price (70%) / Distance (30%)"

### Test 1.4 : Persistance

**Vérifications** :
- [ ] Configurer : geoloc ON, radius 15km, priceWeight 60%
- [ ] Sauvegarder et fermer modal
- [ ] Recharger la page (`F5`)
- [ ] Rouvrir le modal
- [ ] Valeurs précédentes sont conservées

---

## Test 2 : Magasins favoris

### Objectif
Vérifier la sélection et la persistance des magasins favoris.

### Étapes

1. **Naviguer** vers `/settings`
2. **Section** "Shopping Optimization"
3. **Sous-section** "Favorite Stores"
4. **Cliquer** "Manage"

### Test 2.1 : Sélection

**Vérifications** :
- [ ] Liste de tous les magasins affichée
- [ ] Chaque magasin montre : nom + location
- [ ] Cliquer un magasin → fond devient bleu + icône ★
- [ ] Cliquer à nouveau → désélection
- [ ] Sélectionner 2 magasins
- [ ] Cliquer "Save" → toast de confirmation

### Test 2.2 : Affichage

**Vérifications** :
- [ ] Fermer le modal
- [ ] Chips des favoris affichés sous "Favorite Stores"
- [ ] Nombre de chips = nombre de favoris sélectionnés
- [ ] Texte des chips = noms des magasins

### Test 2.3 : Persistance

**Vérifications** :
- [ ] Recharger la page
- [ ] Chips toujours affichés
- [ ] Rouvrir modal → magasins toujours sélectionnés

---

## Test 3 : Enrichissement GPS

### Objectif
Vérifier le géocodage automatique et manuel des magasins.

### Test 3.1 : Enrichissement automatique (nouveau magasin)

**Prérequis** : Avoir accès à la création de magasin

**Étapes** :
1. **Créer** un nouveau prix pour un produit
2. **Étape Store** : Entrer nom + location :
   - Nom : "Carrefour"
   - Location : "Lyon, France"
3. **Soumettre** le formulaire

**Vérifications** :
- [ ] Magasin créé avec succès
- [ ] Console serveur affiche :
   ```
   [GPS Enrichment] Carrefour @ Lyon, France: { latitude: 45.xxxx, longitude: 4.xxxx }
   ```
- [ ] Vérifier en base : `Store.latitude` et `Store.longitude` non-null

### Test 3.2 : Page d'administration

**Étapes** :
1. **Naviguer** vers `/admin/stores`
2. **Vérifier** l'affichage

**Vérifications UI** :
- [ ] Titre "Store GPS Enrichment"
- [ ] Bouton "Enrich All" visible
- [ ] 3 cartes statistiques :
  - [ ] "Without coordinates" (nombre)
  - [ ] "In progress" (0 initialement)
  - [ ] "Total prices" (somme)

### Test 3.3 : Enrichissement single

**Prérequis** : Avoir au moins 1 magasin sans coordonnées

**Étapes** :
1. **Créer manuellement** un magasin en base avec lat/lng NULL
2. **Recharger** `/admin/stores`
3. **Localiser** le magasin dans la liste
4. **Cliquer** "Enrich"

**Vérifications** :
- [ ] Bouton passe en loading (spinner)
- [ ] Après ~1-2 secondes : toast de succès
- [ ] Magasin disparaît de la liste
- [ ] Statistique "Without coordinates" décrémente
- [ ] Console serveur : `✓ Enriched: StoreName @ Location`

**Cas d'échec** :
1. **Créer** magasin avec location invalide : "Test @ InvalidLocation"
2. **Enrich** → toast warning "Unable to find coordinates"
3. **Vérifier** : magasin reste dans la liste

### Test 3.4 : Enrichissement batch

**Prérequis** : Avoir 3+ magasins sans coordonnées

**Étapes** :
1. **Créer** 3 magasins manuellement (lat/lng NULL) :
   - "Casino" @ "Marseille, France"
   - "Auchan" @ "Lille, France"
   - "InvalidStore" @ "UnknownCity"
2. **Cliquer** "Enrich All"

**Vérifications** :
- [ ] Bouton passe en loading
- [ ] Statistique "In progress" s'incrémente progressivement
- [ ] Après ~5-10 secondes : toast avec résultat
   - Exemple : "Enrichment completed: 2 succeeded, 1 failed"
- [ ] Console serveur affiche :
   ```
   ✓ Enriched: Casino @ Marseille, France
   ✓ Enriched: Auchan @ Lille, France
   ✗ Failed: InvalidStore @ UnknownCity
   ```
- [ ] Seul "InvalidStore" reste dans la liste

### Test 3.5 : Tous enrichis

**Étapes** :
1. **Enrichir** tous les magasins
2. **Vérifier** l'affichage

**Vérifications** :
- [ ] Liste vide
- [ ] Carte de succès affichée :
   - [ ] Icône ✓ verte
   - [ ] Titre "All stores enriched!"
   - [ ] Message explicatif
- [ ] Bouton "Enrich All" désactivé

---

## Test 4 : Sélection optimale des prix

### Objectif
Vérifier les 4 scénarios de sélection de prix.

### Prérequis données

**Magasins** (avec coordonnées GPS) :
- Carrefour @ (48.8566, 2.3522) - Paris centre
- Monoprix @ (48.8414, 2.2887) - Paris 15e (2.5 km)
- Auchan @ (48.8353, 2.2402) - Boulogne (5 km)

**Produit** : Lait 1L (barcode: 123456)

**Prix** :
- Carrefour : 1,20€
- Monoprix : 1,30€
- Auchan : 1,00€ (le moins cher)

### Test 4.1 : Scenario "best_price" (sans géoloc)

**Configuration** :
- Géolocalisation : OFF
- Favoris : Aucun

**Étapes** :
1. **Créer** une liste de courses
2. **Ajouter** le produit "Lait 1L"
3. **Vérifier** le prix affiché

**Vérifications** :
- [ ] Prix affiché : **1,00€** (Auchan - le moins cher)
- [ ] Raison : `best_price`
- [ ] Pas de distance affichée
- [ ] Badge : 💰 "Best price"

### Test 4.2 : Scenario "best_price_distance" (avec géoloc)

**Configuration** :
- Géolocalisation : ON (Paris centre : 48.8566, 2.3522)
- Radius : 10 km
- PriceWeight : 70%
- Favoris : Aucun

**Calculs attendus** :
- Carrefour : 1,20€ + (0 km × 0,50€) = 1,20 (score = 1,20 × 0.7 + 0 × 0.3 = 0.84)
- Monoprix : 1,30€ + (2.5 km × 0,50€) = 2,55 (score = 1,30 × 0.7 + 1.25 × 0.3 = 1.29)
- Auchan : 1,00€ + (5 km × 0,50€) = 3,50 (score = 1,00 × 0.7 + 2.50 × 0.3 = 1.45)

**Meilleur score** : Carrefour (0.84)

**Vérifications** :
- [ ] Prix affiché : **1,20€** (Carrefour)
- [ ] Distance : **0 km** (ou très proche)
- [ ] Raison : `best_price_distance`
- [ ] Badge : 📍 "Best price + distance"

**Suggestion d'économie** :
- [ ] Message : "Économisez 0,20€ en allant chez Auchan (5 km)"

### Test 4.3 : Scenario "favorite_store"

**Configuration** :
- Géolocalisation : ON
- Favoris : Monoprix
- PriceWeight : 70%

**Vérifications** :
- [ ] Prix affiché : **1,30€** (Monoprix - favori)
- [ ] Distance : **2.5 km**
- [ ] Raison : `favorite_store`
- [ ] Badge : ⭐ "Favorite store"

**Suggestion** :
- [ ] "Économisez 0,30€ en allant chez Auchan (5 km)"

### Test 4.4 : Scenario "user_selected_store"

**Configuration** :
- Géolocalisation : ON
- Favoris : Monoprix

**Étapes** :
1. **Cliquer** bouton "Store" en haut de la liste
2. **Sélectionner** "Auchan"
3. **Vérifier** le prix

**Vérifications** :
- [ ] Prix affiché : **1,00€** (Auchan - sélectionné manuellement)
- [ ] Distance : **5 km**
- [ ] Raison : `user_selected_store`
- [ ] Badge : 🎯 "Selected store"
- [ ] Tous les items utilisent Auchan (même si pas le meilleur score)

### Test 4.5 : Filtrage par rayon

**Configuration** :
- Géolocalisation : ON (Paris centre)
- Radius : **3 km** (au lieu de 10 km)
- Favoris : Aucun

**Magasins dans le rayon** :
- Carrefour : 0 km ✅
- Monoprix : 2.5 km ✅
- Auchan : 5 km ❌ (hors rayon)

**Vérifications** :
- [ ] Prix affiché : **1,20€** ou **1,30€** (Carrefour ou Monoprix)
- [ ] Auchan n'est pas proposé (hors rayon)
- [ ] Pas de suggestion vers Auchan

**Augmenter le rayon** :
1. **Settings** → Radius : 10 km
2. **Recharger** la liste
3. **Vérifier** : Auchan maintenant proposé

---

## Test 5 : Récapitulatif et totaux

### Objectif
Vérifier le calcul des totaux et le récapitulatif par magasin.

### Données de test

**Liste de courses** :
- Lait 1L (Carrefour 1,20€)
- Pain (Monoprix 0,90€)
- Œufs (Carrefour 2,50€)
- Beurre (Auchan 1,80€)
- Fromage (Monoprix 3,20€)

### Test 5.1 : Récapitulatif par magasin

**Vérifications UI** :
- [ ] Section "Store Summary" visible en bas de liste
- [ ] 3 lignes affichées :
   ```
   📍 Carrefour : 2 articles - 3,70€
   📍 Monoprix : 2 articles - 4,10€
   📍 Auchan : 1 article - 1,80€
   ```
- [ ] Total général : **9,60€**

### Test 5.2 : Économies potentielles

**Calcul** :
Si on allait uniquement au magasin le moins cher pour chaque produit vs le magasin avec le meilleur score.

**Vérifications** :
- [ ] Ligne "Économies potentielles" affichée
- [ ] Montant : Ex. "Économisez 1,20€ en optimisant vos trajets"
- [ ] Couleur verte si > 0€

### Test 5.3 : Magasin optimal

**Vérifications** :
- [ ] Ligne "Meilleur magasin" affichée
- [ ] Nom du magasin avec le plus d'articles ou le meilleur sous-total
- [ ] Exemple : "Monoprix (2 articles)"

---

## Test 6 : Performance

### Objectif
Vérifier que le système est rapide même avec beaucoup de données.

### Test 6.1 : Grande liste

**Étapes** :
1. **Créer** une liste avec 50 produits
2. **Mesurer** le temps de chargement

**Vérifications** :
- [ ] Chargement initial < 2 secondes
- [ ] Affichage progressif (skeleton loaders)
- [ ] Pas de freeze UI

### Test 6.2 : Changement de préférences

**Étapes** :
1. **Liste** ouverte avec 20+ produits
2. **Changer** radius de 10km à 5km
3. **Mesurer** le temps de recalcul

**Vérifications** :
- [ ] Recalcul < 500ms
- [ ] UI reste responsive
- [ ] Nouveaux prix affichés correctement

---

## Test 7 : Edge cases

### Test 7.1 : Produit sans prix

**Étapes** :
1. **Ajouter** un produit qui n'a aucun prix en base
2. **Vérifier** l'affichage

**Vérifications** :
- [ ] Message "Aucun prix disponible"
- [ ] Pas d'erreur JavaScript
- [ ] Total exclut ce produit

### Test 7.2 : Magasin sans coordonnées

**Étapes** :
1. **Créer** un magasin sans lat/lng
2. **Ajouter** un prix pour ce magasin
3. **Vérifier** dans liste de courses

**Vérifications** :
- [ ] Prix affiché si c'est le seul disponible
- [ ] Pas de distance affichée (ou "N/A")
- [ ] Pas inclus dans calculs de distance

### Test 7.3 : Tous magasins hors rayon

**Configuration** :
- Géolocalisation : ON
- Radius : 1 km
- Tous les magasins à > 1 km

**Vérifications** :
- [ ] Aucun prix proposé (ou message approprié)
- [ ] Suggestion d'augmenter le rayon
- [ ] Pas d'erreur

### Test 7.4 : Plusieurs magasins même score

**Données** :
- 2 magasins avec même prix ET même distance

**Vérifications** :
- [ ] Un des deux est sélectionné (déterministe)
- [ ] Pas d'erreur

---

## Test 8 : Responsive / Mobile

### Test 8.1 : Settings modal mobile

**Étapes** :
1. **Ouvrir** l'app sur mobile (ou DevTools responsive mode)
2. **Settings** → Shopping Optimization → Configure

**Vérifications** :
- [ ] Modal s'affiche en bottom sheet (pas en modal classique)
- [ ] Sliders tactiles et utilisables
- [ ] Boutons "Save" / "Cancel" accessibles
- [ ] Pas de scroll horizontal

### Test 8.2 : Liste de courses mobile

**Vérifications** :
- [ ] Prix et distances lisibles
- [ ] Cards responsive (pas trop larges)
- [ ] Store summary visible en bas
- [ ] Pas de débordement de texte

---

## Test 9 : Accessibilité

### Test 9.1 : Navigation clavier

**Vérifications** :
- [ ] Tab traverse tous les éléments interactifs
- [ ] Focus visible (outline)
- [ ] Enter/Space activent les boutons
- [ ] Escape ferme les modals

### Test 9.2 : Screen reader

**Vérifications** :
- [ ] Labels des sliders lisibles
- [ ] États (Active, Missing, etc.) annoncés
- [ ] Toasts accessibles

---

## Checklist finale

### Fonctionnalités critiques
- [ ] Préférences se sauvegardent et persistent
- [ ] Géolocalisation fonctionne (avec permission)
- [ ] Magasins favoris sélectionnables
- [ ] Enrichissement GPS (auto + manuel)
- [ ] Prix optimaux affichés correctement
- [ ] 4 scénarios de sélection fonctionnent
- [ ] Totaux et récapitulatifs corrects
- [ ] Performance acceptable (<2s chargement)

### Edge cases
- [ ] Produit sans prix géré
- [ ] Magasin sans GPS géré
- [ ] Tous magasins hors rayon géré
- [ ] Erreur Photon API gérée

### UX
- [ ] Responsive mobile
- [ ] Accessibilité clavier
- [ ] Messages d'erreur clairs
- [ ] Toasts de confirmation

---

## Bugs connus / Limitations

### À documenter

1. **Photon API rate limit** : Si >100 magasins enrichis d'un coup, peut échouer
   - **Workaround** : Batch par petits groupes

2. **Geolocation en HTTP** : Peut ne pas fonctionner sur certains navigateurs
   - **Solution** : Utiliser HTTPS en production

3. **Cache browser** : Préférences peuvent ne pas se mettre à jour immédiatement
   - **Workaround** : Hard refresh (Cmd+Shift+R)

---

## Rapport de test

### Template

```markdown
## Test Report - Date: YYYY-MM-DD

### Environment
- Browser: Chrome 120 / Firefox 121 / Safari 17
- OS: macOS / Windows / Linux
- Device: Desktop / Mobile

### Tests executés
- [ ] Test 1: Configuration préférences
- [ ] Test 2: Magasins favoris
- [ ] Test 3: Enrichissement GPS
- [ ] Test 4: Sélection optimale
- [ ] Test 5: Récapitulatifs
- [ ] Test 6: Performance
- [ ] Test 7: Edge cases
- [ ] Test 8: Responsive
- [ ] Test 9: Accessibilité

### Bugs trouvés
1. [BUG-001] Description
   - Sévérité: Critical / High / Medium / Low
   - Steps to reproduce: ...
   - Expected: ...
   - Actual: ...

### Résultat global
✅ PASSED / ⚠️ PASSED WITH ISSUES / ❌ FAILED

### Notes
- ...
```

---

**Auteur** : GitHub Copilot  
**Date** : 2024-01-13  
**Version** : 1.0.0
