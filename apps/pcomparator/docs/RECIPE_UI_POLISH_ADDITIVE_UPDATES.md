# Recipe UI Polish & Additive System Updates

## Summary
Complete overhaul of recipe and additive display systems with mobile-first improvements, 4-level risk assessment (like Yuka), and database-backed tips.

## Changes Made

### 1. Additive Risk Assessment System (4 Levels)

#### Updated Schema: `ProductQuality.vo.ts`
- Changed from 3 levels (`low`, `moderate`, `high`) to 4 levels: `safe`, `moderate`, `high_risk`, `dangerous`
- Improved OpenFoodFacts parsing to extract additive names properly
- Enhanced risk assessment logic using OFF categories (sulphites, benzoates, nitrites, tartrazine, etc.)

**Risk Level Mapping:**
- **Safe** (Green) → `success` color → Generally safe additives
- **Moderate** (Yellow) → `warning` color → Consume in moderation
- **High Risk** (Orange) → `warning` color → May present risks for some people
- **Dangerous** (Red) → `danger` color → Significant health risks

#### New Utility: `AdditiveRiskMapping.ts`
```typescript
Location: src/applications/Recipes/Domain/Utilities/AdditiveRiskMapping.ts

Exports:
- getAdditiveRiskColor(riskLevel) → HeroUI color ("success" | "warning" | "danger")
- getAdditiveRiskTailwind(riskLevel) → Tailwind classes (green/yellow/orange/red)
- getAdditiveRiskLabel(riskLevel) → Human-readable label
```

### 2. Recipe Ingredient Display Redesign

#### Before (3 lines, cluttered):
- Line 1: Name + Quantity
- Line 2: Price + Store + Distance (chips)
- Line 3: Labels + Allergens + NutriScore (chips)

#### After (2 lines, cleaner):
```
Line 1: Name | Quantity + Price (bold green)
Line 2: Store, Distance, Labels, Allergens, NutriScore (compact chips)
```

**Key improvements:**
- Card-based layout with borders instead of border-left
- Removed DollarSign icon (unused import cleaned)
- Price displayed inline as bold green text
- More scannable for cooking

### 3. Additive Display in Recipes

#### `RecipeDetailsMobile.tsx`
**Before:** Simple count badge (`12 additifs`)

**After:** Detailed list with names and risk colors
```tsx
Additifs détectés:
[E330 Citric acid] (green)
[E414 Gum arabic] (yellow)
[E951 Aspartame] (red)
```

**Implementation:**
- Updated `RecipeComputeQualityService` to aggregate full additive details
- Added `additives` and `allergens` arrays to `RecipeQualityResult` interface
- Displays each additive with risk-colored chip
- Separate section for allergens with warning color

### 4. Database-Backed Recipe Tips

#### Prisma Schema Addition
```prisma
model RecipeTip {
  id        String   @id @default(uuid()) @db.Uuid
  recipeId  String   @db.Uuid
  title     String?
  content   String
  category  String   @default("general")
  order     Int      @default(0)
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  recipe    Recipe   @relation(fields: [recipeId], references: [id], onDelete: Cascade)

  @@index([recipeId])
}
```

#### Migration
- Created migration: `20251115161424_add_recipe_tips`
- Tips now stored in database instead of hardcoded

#### New API
```typescript
File: src/applications/Recipes/Api/recipes/getRecipeTips.api.ts
Function: getRecipeTips(recipeId: string)
Returns: RecipeTip[]
```

#### Updated Hook: `useRecipeData.ts`
- Added `tips` to return value
- Loads tips in parallel with pricing and quality
- Type: `RecipeTip[]` with id, title, content, category, order

#### UI Changes
- Replaced hardcoded Accordion with Card-based tip display
- Blue-themed cards with left border
- Shows title (if present) + content
- Conditional rendering (only if tips exist)

### 5. Nutrition Section Redesign

#### Before: Ugly Accordion
- Collapsible nested Accordions
- Hard to read on mobile
- Complex interaction

#### After: Expandable Card Grid
- Button toggle: "Show nutrition details" / "Hide details"
- Card-based layout with 2-column grid
- Displays up to 5 ingredients
- Smooth Framer Motion animation
- Labels and allergens in compact grid format

**Layout:**
```
[Ingredient Name]              [NutriScore Chip]
Labels: Bio, Eco              Allergens: None
```

### 6. Shopping List Additive Display

#### Updated: `AdditivesSection.tsx`
**Changes:**
- Updated `getRiskColor()` to support 4 levels
- Updated `getRiskLabel()` with new labels
- Changed warning counts to include `dangerous` and `high_risk`
- Updated color mappings:
  - `dangerous` → red-50, red-500 border
  - `high_risk` → orange-50, orange-500 border
  - `moderate` → yellow-50, yellow-500 border
  - `safe` → green-50, green-500 border
- Info section now shows 4 risk levels with explanations

## Files Modified

### Core Logic
1. `ProductQuality.vo.ts` - Additive schema and parsing
2. `RecipeComputeQuality.service.ts` - Quality calculation with full additive aggregation
3. `schema.prisma` - Added RecipeTip model

### UI Components
4. `RecipeDetailsMobile.tsx` - Ingredient display, additive section, tips section, nutrition details
5. `AdditivesSection.tsx` - Shopping list additive display with 4 levels
6. `useRecipeData.ts` - Hook to load tips from API

### New Files
7. `AdditiveRiskMapping.ts` - Utility for risk color mapping
8. `getRecipeTips.api.ts` - Server Action to fetch tips

### Database
9. Migration: `20251115161424_add_recipe_tips/migration.sql`

## Testing Checklist

- [ ] Recipe page displays ingredients with cleaner 2-line layout
- [ ] Additives show names with correct risk colors (green/yellow/orange/red)
- [ ] Tips load from database (if any exist for recipe)
- [ ] Nutrition details expand/collapse smoothly
- [ ] Shopping list product detail shows 4-level additive risks
- [ ] OpenFoodFacts data correctly parsed during product creation
- [ ] No TypeScript compilation errors
- [ ] Mobile-first design works on small screens

## Migration Path

To use the tips system:
1. Database already migrated (RecipeTip table created)
2. Create tips via Prisma client:
```typescript
await prisma.recipeTip.create({
  data: {
    recipeId: "...",
    title: "Storage tip",
    content: "Store in fridge for 2-3 days",
    category: "storage",
    order: 1
  }
});
```

## Future Enhancements

- Add tip management UI (CRUD operations)
- Import additive database from OpenFoodFacts for more accurate risk assessment
- Add i18n translations for all new English strings
- Create seed data for common recipe tips
- Add filtering/sorting for additives by risk level

## Related Documentation

- Original feature: `docs/MOBILE_DEVELOPMENT.md`
- DDD patterns: `.github/copilot-instructions.md`
- Prisma schema: `prisma/schema.prisma`
