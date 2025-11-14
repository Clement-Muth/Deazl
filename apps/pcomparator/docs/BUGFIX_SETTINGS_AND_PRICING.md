# Bug Fixes: Settings UI & Price Selection Logic

**Date:** 2024
**Status:** ✅ Completed

## Issues Fixed

### 1. Settings: User Location Not Loaded from Database ✅

**Symptom:** Settings always showed "Not configured" even when location was saved in DB.

**Root Cause:** In `OptimalPricing.tsx` line 43, `userLocation` was hardcoded to `undefined` instead of loading from preferences.

**Fix:**
```typescript
// BEFORE
userLocation: undefined

// AFTER
userLocation: prefs.userLocation
```

**Files Changed:**
- `apps/pcomparator/src/applications/Profile/Ui/Settings/OptimalPricing.tsx` (line 43)

**Impact:** Settings now correctly load saved geolocation from database and display "Active" status.

---

### 2. Settings: Price Weight Slider Math Error ✅

**Symptom:** Slider value barely changed, percentage didn't match visual position.

**Root Cause:** Slider value was multiplied by 100 (`* 100`) but onChange divided by 100, creating a 0-100 range instead of 0-1.

**Fix:**
```typescript
// BEFORE
value={(preferences.priceWeight || 0.7) * 100}
onChange={(val) => setPreferences({ ...preferences, priceWeight: val / 100 })}
step={0.05}

// AFTER
value={preferences.priceWeight || 0.7}
onChange={(val) => setPreferences({ ...preferences, priceWeight: val })}
step={0.01}
```

**Files Changed:**
- `apps/pcomparator/src/applications/Profile/Ui/Settings/OptimalPricing.tsx` (lines 310-320)

**Impact:** Slider now works correctly with proper 0-1 range and finer control (0.01 step).

---

### 3. Settings: Dynamic Value Labels Missing ✅

**Symptom:** Sliders only showed emoji labels, no numeric feedback during sliding.

**Fix - Radius Slider:**
```typescript
getValue={(val) => `${val} km`}
```

**Fix - Price Weight Slider:**
```typescript
getValue={(val) => {
  const pricePct = Math.round(val * 100);
  const distPct = 100 - pricePct;
  return `💰 ${pricePct}% / 🚗 ${distPct}%`;
}}
```

**Additional:** Added explanatory text below price slider:
- "Prioritize low prices, even if the store is further away" (≥70%)
- "Balance between price and proximity" (50-70%)
- "Prioritize nearby stores, even if prices are higher" (<50%)

**Files Changed:**
- `apps/pcomparator/src/applications/Profile/Ui/Settings/OptimalPricing.tsx`

**Impact:** Users now see real-time numeric feedback while adjusting sliders.

---

### 4. Settings: Button Text Not Updating ✅

**Symptom:** Geolocation button always showed "Enable" instead of "Update Location" when active.

**Root Cause:** Button text was static, not conditional on `hasGeolocation` state.

**Fix:**
```typescript
// BEFORE
<Button>
  <Trans>Enable</Trans>
</Button>

// AFTER
<Button
  color={hasGeolocation ? "success" : "primary"}
  variant={hasGeolocation ? "flat" : "solid"}
>
  {hasGeolocation ? <Trans>Update Location</Trans> : <Trans>Enable</Trans>}
</Button>
```

**Files Changed:**
- `apps/pcomparator/src/applications/Profile/Ui/Settings/OptimalPricing.tsx` (line 280)

**Impact:** Button now shows correct action ("Update Location" when active).

---

### 5. Shopping List: selectedPriceId Not Respected ✅

**Symptom:** When user manually selected a price for an item, the system ignored it and recalculated automatically.

**Root Cause:** `selectedPriceId` was not passed through the pricing pipeline:
1. `useOptimalPricing` didn't include it in `itemsWithPrices`
2. `OptimalPricingService.selectOptimalPrice()` didn't have parameter for it
3. No priority check for manually selected prices

**Fix:**

**Step 1 - Add Priority Check in OptimalPricingService:**
```typescript
public selectOptimalPrice(
  itemId: string,
  productId: string,
  quantity: number,
  unit: string,
  availablePrices: PriceData[],
  options: PriceSelectionOptions = {},
  selectedPriceId?: string | null  // NEW PARAMETER
): ItemOptimalPrice {
  // PRIORITÉ 0 : Si l'utilisateur a manuellement sélectionné un prix, le respecter
  if (selectedPriceId) {
    const manuallySelected = availablePrices.find((p) => p.id === selectedPriceId);
    if (manuallySelected) {
      const bestPriceResult = findBestPrice([manuallySelected]);
      if (bestPriceResult) {
        const selectedPrice = this.enrichPriceWithDistance(bestPriceResult, options.userPreferences);
        return {
          itemId,
          productId,
          quantity,
          unit,
          selectedPrice,
          availablePrices: this.enrichPricesWithDistance(availablePrices, options.userPreferences),
          selectionReason: "user_selected_store"
        };
      }
    }
  }
  // ... rest of logic
}
```

**Step 2 - Update calculateOptimalTotal:**
```typescript
public calculateOptimalTotal(
  items: Array<{
    itemId: string;
    productId: string;
    quantity: number;
    unit: string;
    availablePrices: PriceData[];
    selectedPriceId?: string | null;  // NEW FIELD
  }>,
  options: PriceSelectionOptions = {}
): { /* ... */ } {
  const itemsWithPrices = items.map((item) =>
    this.selectOptimalPrice(
      item.itemId,
      item.productId,
      item.quantity,
      item.unit,
      item.availablePrices,
      options,
      item.selectedPriceId  // PASS IT THROUGH
    )
  );
  // ...
}
```

**Step 3 - Update useOptimalPricing Hook:**
```typescript
const itemsWithPrices = items
  .filter((item) => item.productId && rawPrices[item.productId])
  .map((item) => ({
    itemId: item.id,
    productId: item.productId as string,
    quantity: item.quantity,
    unit: item.unit,
    availablePrices: rawPrices[item.productId as string],
    selectedPriceId: item.selectedPriceId  // INCLUDE IT
  }));
```

**Files Changed:**
- `apps/pcomparator/src/packages/applications/shopping-lists/src/Domain/Services/OptimalPricingService.ts` (lines 88-120, 337)
- `apps/pcomparator/src/packages/applications/shopping-lists/src/Ui/ShoppingListDetails/useOptimalPricing.ts` (line 92)

**Impact:** Manual price selection now has highest priority and is respected throughout the system.

---

## Priority Order After Fixes

The system now respects the following priority order when selecting prices:

1. **PRIORITY 0**: User manually selected price (`selectedPriceId`) → **NEW**
2. **PRIORITY 1**: User selected store(s) (`selectedStoreIds`)
3. **PRIORITY 2**: Favorite stores (if geolocation + favorites configured)
4. **PRIORITY 3**: Best price/distance optimization (if geolocation active)
5. **PRIORITY 4**: Best price (fallback)

---

## Testing Checklist

### Settings UI
- [x] Location loads from DB on page load
- [x] "Active" status shows when location saved
- [x] Button says "Update Location" when active
- [x] Button says "Enable" when not configured
- [x] Radius slider shows current value (e.g., "10 km")
- [x] Price weight slider shows percentages (e.g., "💰 70% / 🚗 30%")
- [x] Price weight changes smoothly with fine control (0.01 steps)
- [x] Explanatory text updates based on slider position

### Price Selection Logic
- [x] Manual price selection (`selectedPriceId`) is respected
- [x] Selected store takes precedence when no manual selection
- [x] Favorite stores work without manual store selection
- [x] Geolocation + radius filtering works correctly
- [x] Fallback to best price when no preferences set

---

## Migration Notes

### Breaking Changes
None. All changes are backward compatible.

### Database
No migration required. Uses existing fields:
- `User.optimizationPreferences.userLocation` (already exists)
- `ShoppingListItem.selectedPriceId` (already exists)

### API Changes
**OptimalPricingService.selectOptimalPrice()** - New optional parameter:
```typescript
// OLD SIGNATURE
selectOptimalPrice(
  itemId, productId, quantity, unit, availablePrices, options
)

// NEW SIGNATURE
selectOptimalPrice(
  itemId, productId, quantity, unit, availablePrices, options,
  selectedPriceId?: string | null  // NEW - OPTIONAL
)
```

Calling code without `selectedPriceId` continues to work unchanged.

---

## Performance Impact

**Minimal.** Changes add:
- 1 additional check (selectedPriceId lookup) per item - O(n) where n = availablePrices
- No database queries added
- No additional API calls

---

## Related Documentation

- `OPTIMAL_PRICING_README.md` - Overall system design
- `USER_GUIDE_OPTIMAL_PRICING.md` - User-facing guide
- `IMPLEMENTATION_SUMMARY.md` - Technical implementation details
- `ARCHITECTURE.md` - DDD patterns and structure

---

## Commit Message

```
fix(settings): fix settings UI bugs and respect manual price selection

BREAKING: None

Fixes:
- Settings: Load userLocation from DB instead of undefined
- Settings: Fix priceWeight slider math (0-1 range, 0.01 step)
- Settings: Add dynamic value labels to sliders
- Settings: Update button text based on geolocation state
- Pricing: Respect item.selectedPriceId as highest priority

Files:
- OptimalPricing.tsx: Fix loadPreferences, sliders, button
- OptimalPricingService.ts: Add selectedPriceId priority
- useOptimalPricing.ts: Pass selectedPriceId through

Impact:
- Settings now correctly display saved preferences
- Manual price selections are respected
- Better UX with real-time slider feedback

Testing:
- All TypeScript errors resolved
- No breaking changes to API
- Backward compatible
```

---

## Author Notes

These bugs were identified during user testing phase. The root causes were:
1. Copy-paste error (`undefined` instead of loading from prefs)
2. Unit conversion mistake (multiplying then dividing by 100)
3. Missing feature implementation (selectedPriceId not wired up)

All fixes maintain the existing DDD architecture and don't introduce breaking changes.
