# Test Plan - Price Selection Priority System

## Objectif
Vérifier que le système de sélection de prix respecte la hiérarchie de priorités :
1. **selectedPriceId** (prix manuellement sélectionné par l'utilisateur) - PRIORITÉ ABSOLUE
2. **selectedStoreIds** (magasin(s) sélectionné(s) manuellement)
3. **Favorite stores** (magasins favoris de l'utilisateur)
4. **Geographic + price optimization** (optimisation distance + prix)
5. **Best price fallback** (meilleur prix disponible)

## Prérequis
- Serveur dev lancé : `yarn dev:pcomparator`
- Utilisateur connecté
- Au moins 1 liste de courses avec 1 item ayant plusieurs prix disponibles
- Au moins 2 magasins favoris configurés dans les settings
- Console browser DevTools ouverte pour voir les logs

## Test 1 : Vérification du mapping selectedPriceId

### Étapes
1. Ouvrir la liste de courses : `http://localhost:3001/fr/shopping-lists/f44a7806-2895-49de-a2ab-e1a141ddadcd`
2. Ouvrir la console browser (F12)
3. Chercher le log : `Rendering ShoppingListContainer with items:`
4. Vérifier dans l'objet affiché qu'il contient bien le champ `selectedPriceId`

### Résultat attendu
```javascript
{
  "id": "96bae6a4-f310-446f-a6c1-c92889420472",
  "shoppingListId": "cdc43744-9082-4595-8253-085cd1e001f5",
  "productId": "4d0eab53-fd1e-4210-9070-46ca3c212d4a",
  "quantity": 1,
  "unit": "unit",
  "isCompleted": false,
  "selectedPriceId": "xxx-xxx-xxx-xxx", // ✅ CE CHAMP DOIT ÊTRE PRÉSENT
  "product": {...}
}
```

### Statut
- [ ] PASS - Le champ `selectedPriceId` est présent
- [ ] FAIL - Le champ est absent ou undefined

---

## Test 2 : Priority 0 - selectedPriceId (Manual Price Selection)

### Étapes
1. Sur la liste de courses, trouver un item avec plusieurs prix disponibles
2. Cliquer sur "Voir alternatives" ou le bouton pour changer de prix
3. **Sélectionner un prix d'un magasin qui N'EST PAS dans vos favoris** (ex: Auchan si vos favoris sont Lidl/Carrefour)
4. Rafraîchir la page complète (F5)
5. Vérifier dans les logs de la console :

### Logs attendus
```
[OptimalPricing] Item 96bae6a4-...: Starting price selection
[OptimalPricing] - selectedPriceId: "abc-123-def-456"  // ✅ ID du prix Auchan
[OptimalPricing] - Available prices: 4
[OptimalPricing] Item 96bae6a4-...: Looking for selectedPriceId="abc-123-def-456"
[OptimalPricing] Available price IDs: [
  { id: "abc-123-def-456", storeId: "...", storeName: "Auchan" },
  { id: "xyz-789-...", storeId: "...", storeName: "Lidl" },
  ...
]
[OptimalPricing] ✅ Found selectedPrice: Auchan - 4.50€
```

### Résultat attendu
- Le prix **Auchan** doit être affiché même si **Lidl est dans vos favoris**
- La raison de sélection doit être : `"user_selected_store"`
- Le prix manuel doit être respecté AVANT tout autre critère

### Statut
- [ ] PASS - Le prix manuellement sélectionné est respecté
- [ ] FAIL - Un autre prix est affiché (favorite store ou autre)

---

## Test 3 : Priority 1 - selectedStoreIds (Manual Store Selection)

### Étapes
1. Enlever le `selectedPriceId` de l'item (réinitialiser la sélection)
2. Dans le sélecteur de magasin en haut, choisir un magasin spécifique (ex: Intermarché)
3. Vérifier les logs

### Logs attendus
```
[OptimalPricing] - selectedPriceId: none
[OptimalPricing] - Selected store IDs: ["intermarché-store-id"]
[OptimalPricing] CAS 1 - Magasin(s) explicitement sélectionné(s)
[OptimalPricing] Found 2 prices in selected stores: [...]
[OptimalPricing] ✅ Selected price from selected stores: Intermarché - 3.99€
```

### Résultat attendu
- Prix d'Intermarché affiché
- Raison : `"user_selected_store"`

### Statut
- [ ] PASS
- [ ] FAIL

---

## Test 4 : Priority 2 - Favorite Stores (Before Geographic Filter)

### Configuration préalable
1. Aller dans Settings : `http://localhost:3001/fr/settings`
2. Configurer 4 magasins favoris (ex: Lidl, Carrefour, Auchan, Leclerc)
3. Configurer un rayon géographique **très restrictif** : 1 km
4. S'assurer qu'au moins un magasin favori est **hors du rayon** de 1km

### Étapes
1. Retirer tout `selectedPriceId` et `selectedStoreIds`
2. Ouvrir la liste de courses
3. Vérifier les logs

### Logs attendus
```
[OptimalPricing] - selectedPriceId: none
[OptimalPricing] - Selected store IDs: none
[OptimalPricing] CAS 2 - Auto-optimization
[OptimalPricing] - Max radius: 1
[OptimalPricing] - All available stores (4): [...]
[OptimalPricing] 🌟 Checking favorite stores for item xxx (before geo-filter): ["lidl-id", "carrefour-id", ...]
[OptimalPricing] Found 3 prices in favorite stores: [
  { storeName: "Lidl", amount: 3.55, storeId: "..." },
  { storeName: "Carrefour", amount: 3.89, storeId: "..." },
  ...
]
[OptimalPricing] ✅ Selected FAVORITE store: Lidl - 3.55€ (ignoring geo-filter for favorites)
```

### Résultat attendu
- Un magasin **favori** est sélectionné **MÊME S'IL EST HORS DU RAYON DE 1KM**
- La raison doit être : `"favorite_store"`
- Le log doit dire : `"(ignoring geo-filter for favorites)"`

### Statut
- [ ] PASS - Les favoris ignorent le filtre géographique
- [ ] FAIL - Le système dit "No stores within radius"

---

## Test 5 : Priority 3 - Geographic Optimization (Only if no favorites)

### Configuration préalable
1. **Retirer tous les magasins favoris** dans Settings
2. Garder le rayon géographique à 5km
3. Configurer votre localisation à Paris centre

### Étapes
1. Ouvrir la liste de courses
2. Vérifier les logs

### Logs attendus
```
[OptimalPricing] - Favorite store IDs: []
[OptimalPricing] 🌍 Filtering by radius: 5km (no favorite store found)
[OptimalPricing] After radius filter: 2 prices remain [...]
[OptimalPricing] ✅ Selected price from geo+price optimization: Franprix - 3.99€
```

### Résultat attendu
- Seuls les magasins **dans le rayon** sont considérés
- Le meilleur prix parmi eux est sélectionné
- Raison : `"geo_price_optimized"`

### Statut
- [ ] PASS
- [ ] FAIL

---

## Test 6 : Priority 4 - Best Price Fallback

### Configuration préalable
1. Aucun magasin favori
2. Aucun filtre géographique (maxRadiusKm = null ou très grand)
3. Aucune sélection manuelle

### Étapes
1. Ouvrir la liste
2. Vérifier les logs

### Logs attendus
```
[OptimalPricing] - No geographic filter
[OptimalPricing] ✅ Selected best available price: Leclerc - 2.99€
```

### Résultat attendu
- Le **prix le plus bas** parmi tous les magasins disponibles
- Raison : `"best_price"`

### Statut
- [ ] PASS
- [ ] FAIL

---

## Résumé des Tests

| Test | Priorité | Description | Statut |
|------|----------|-------------|--------|
| 1 | - | Mapping selectedPriceId | ⏳ |
| 2 | 0 | selectedPriceId (manual) | ⏳ |
| 3 | 1 | selectedStoreIds | ⏳ |
| 4 | 2 | Favorite stores (ignore geo) | ⏳ |
| 5 | 3 | Geographic optimization | ⏳ |
| 6 | 4 | Best price fallback | ⏳ |

---

## Rapport de Bug

Si un test échoue, noter :
- ✅ Test passé
- ❌ Test échoué
- Logs complets de la console
- Comportement observé vs comportement attendu
- Screenshot si possible

---

## Notes

- **Test 4 est critique** : C'était le bug principal corrigé
- **Test 2 est prioritaire** : C'est le bug que vous avez rapporté (Auchan vs Lidl)
- Tous les logs commencent par `[OptimalPricing]` pour faciliter le filtrage
- Les emojis (🌟, 🌍, ✅) aident à identifier rapidement les étapes dans les logs
