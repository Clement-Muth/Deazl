# Recipe Groups Refactoring - Implementation Summary

## ✅ What Has Been Completed

### 1. Database Schema (Prisma)

**File:** `prisma/schema.prisma`

- ✅ Added `IngredientGroup` model with fields: `id`, `recipeId`, `name`, `order`, `createdAt`, `updatedAt`
- ✅ Added `StepGroup` model with fields: `id`, `recipeId`, `name`, `order`, `createdAt`, `updatedAt`
- ✅ Added `groupId` (optional) to `RecipeIngredient` model
- ✅ Added `groupId` (optional) to `RecipeStep` model  
- ✅ Changed `Recipe.description` from `String?` to `String? @db.Text` for multi-line support
- ✅ Changed `RecipeStep.description` from `String` to `String @db.Text`
- ✅ Added proper relations and indexes
- ✅ Migration is ready (schema is in sync)

### 2. Domain Layer

**Files created:**
- ✅ `Domain/Entities/IngredientGroup.entity.ts` - Full entity with immutable patterns
- ✅ `Domain/Entities/StepGroup.entity.ts` - Full entity with immutable patterns

**Files updated:**
- ✅ `Domain/Entities/RecipeIngredient.entity.ts` - Added `groupId` property and `withGroup()` method
- ✅ `Domain/Entities/RecipeStep.entity.ts` - Added `groupId` property and `withGroup()` method
- ✅ `Domain/Schemas/Recipe.schema.ts` - Added:
  - `IngredientGroupSchema`
  - `StepGroupSchema`
  - Updated `RecipeIngredientSchema` with `groupId`
  - Updated `RecipeStepSchema` with `groupId`
  - Updated `CreateRecipeSchema` to accept groups
  - Updated `UpdateRecipeSchema` to accept groups
  - Added validation to require at least one ingredient or group

### 3. Infrastructure Layer (Partial)

**File:** `Infrastructure/Repositories/PrismaRecipe.infrastructure.ts`

- ✅ Added imports for `IngredientGroup` and `StepGroup`
- ✅ Updated `findById()` to include `ingredientGroups` and `stepGroups` in the query
- ⚠️  **TODO:** Update `save()` method to persist groups
- ⚠️  **TODO:** Update `mapToDomain()` to map groups from Prisma
- ⚠️  **TODO:** Update all other query methods to include groups

## 🚧 What Needs To Be Done

### Priority 1: Complete Infrastructure Repository

#### A. Update the `save()` method

The current `save()` method deletes and recreates ingredients/steps. It needs to also handle groups.

**Location:** `Infrastructure/Repositories/PrismaRecipe.infrastructure.ts`, line ~152

**Changes needed:**
1. Delete existing ingredient/step groups before creating new ones
2. Create new ingredient groups with their contained ingredients
3. Create new step groups with their contained steps
4. Update ingredient creation to include `groupId`
5. Update step creation to include `groupId`

**Implementation approach:**
```typescript
// In the transaction, add BEFORE deleting ingredients:
await tx.ingredientGroup.deleteMany({
  where: { recipeId: recipe.id }
});

await tx.stepGroup.deleteMany({
  where: { recipeId: recipe.id }
});

// AFTER creating the recipe, ADD:
// Create ingredient groups
const ingredientGroups = recipe.ingredientGroups || [];
for (const group of ingredientGroups) {
  await tx.ingredientGroup.create({
    data: {
      id: group.id,
      recipeId: recipe.id,
      name: group.name,
      order: group.order
    }
  });
}

// Create step groups
const stepGroups = recipe.stepGroups || [];
for (const group of stepGroups) {
  await tx.stepGroup.create({
    data: {
      id: group.id,
      recipeId: recipe.id,
      name: group.name,
      order: group.order
    }
  });
}

// UPDATE ingredient creation to include groupId:
if (recipe.ingredients.length > 0) {
  await tx.recipeIngredient.createMany({
    data: recipe.ingredients.map((ing) => ({
      id: ing.id,
      recipeId: recipe.id,
      productId: ing.productId,
      quantity: ing.quantity,
      unit: ing.unit,
      order: ing.order,
      groupId: ing.groupId ?? null  // ADD THIS LINE
    }))
  });
}

// UPDATE step creation to include groupId:
if (recipe.steps.length > 0) {
  await tx.recipeStep.createMany({
    data: recipe.steps.map((step) => ({
      id: step.id,
      recipeId: recipe.id,
      stepNumber: step.stepNumber,
      description: step.description,
      duration: step.duration ?? null,
      groupId: step.groupId ?? null  // ADD THIS LINE
    }))
  });
}
```

#### B. Update `mapToDomain()` method

**Location:** `Infrastructure/Repositories/PrismaRecipe.infrastructure.ts`, line ~621

Currently it only maps ingredients and steps. Needs to also map groups.

```typescript
public mapToDomain(recipeData: any): Recipe {
  // Existing ingredient mapping (keep as is)
  const ingredients = recipeData.ingredients.map((ing: any) =>
    RecipeIngredient.create({
      recipeId: recipeData.id,
      productId: ing.productId,
      productName: ing.product?.name,
      quantity: ing.quantity,
      unit: ing.unit,
      order: ing.order,
      groupId: ing.groupId ?? undefined  // ADD THIS
    }, ing.id)
  );

  // Existing step mapping (keep as is)
  const steps = recipeData.steps.map((step: any) =>
    RecipeStep.create({
      recipeId: recipeData.id,
      stepNumber: step.stepNumber,
      description: step.description,
      duration: step.duration ?? undefined,
      groupId: step.groupId ?? undefined  // ADD THIS
    }, step.id)
  );

  // ADD: Map ingredient groups
  const ingredientGroups = (recipeData.ingredientGroups || []).map((group: any) => {
    const groupIngredients = group.ingredients.map((ing: any) =>
      RecipeIngredient.create({
        recipeId: recipeData.id,
        productId: ing.productId,
        productName: ing.product?.name,
        quantity: ing.quantity,
        unit: ing.unit,
        order: ing.order,
        groupId: group.id
      }, ing.id)
    );
    
    return IngredientGroup.create({
      recipeId: recipeData.id,
      name: group.name,
      order: group.order,
      ingredients: groupIngredients
    }, group.id);
  });

  // ADD: Map step groups
  const stepGroups = (recipeData.stepGroups || []).map((group: any) => {
    const groupSteps = group.steps.map((step: any) =>
      RecipeStep.create({
        recipeId: recipeData.id,
        stepNumber: step.stepNumber,
        description: step.description,
        duration: step.duration ?? undefined,
        groupId: group.id
      }, step.id)
    );
    
    return StepGroup.create({
      recipeId: recipeData.id,
      name: group.name,
      order: group.order,
      steps: groupSteps
    }, group.id);
  });

  return Recipe.create({
    // ... existing properties
    ingredients,
    steps,
    ingredientGroups,  // ADD THIS
    stepGroups  // ADD THIS
  }, recipeData.id);
}
```

#### C. Update all query methods to include groups

Update these methods to include the same relations as `findById`:
- `findManyByUserId()`
- `findManyPublic()`
- `searchPublicRecipes()`
- `findByShareToken()`
- `findTrendingPublicRecipes()`
- `findRecentPublicRecipes()`
- `findPublicRecipesByCategory()`
- `findPublicRecipesByCuisine()`
- `findPublicRecipesByTag()`
- `checkUserAccess()`

Add to each:
```typescript
include: {
  ingredients: {
    include: { product: true },
    orderBy: { order: "asc" }
  },
  steps: {
    orderBy: { stepNumber: "asc" }
  },
  ingredientGroups: {  // ADD
    include: {
      ingredients: {
        include: { product: true },
        orderBy: { order: "asc" }
      }
    },
    orderBy: { order: "asc" }
  },
  stepGroups: {  // ADD
    include: {
      steps: {
        orderBy: { stepNumber: "asc" }
      }
    },
    orderBy: { order: "asc" }
  }
}
```

### Priority 2: Update Recipe Entity

**File:** `Domain/Entities/Recipe.entity.ts`

#### Changes needed:

1. Add to `RecipeProps` interface:
```typescript
interface RecipeProps {
  // ... existing
  ingredientGroups?: IngredientGroup[];
  stepGroups?: StepGroup[];
}
```

2. Add import at top:
```typescript
import type { IngredientGroup } from "./IngredientGroup.entity";
import type { StepGroup } from "./StepGroup.entity";
```

3. Add getters:
```typescript
get ingredientGroups(): IngredientGroup[] {
  return this.props.ingredientGroups || [];
}

get stepGroups(): StepGroup[] {
  return this.props.stepGroups || [];
}
```

4. Add `with*()` methods:
```typescript
public withIngredientGroups(groups: IngredientGroup[]): Recipe {
  return new Recipe(
    { ...this.props, ingredientGroups: groups, updatedAt: new Date() },
    this._id.toValue()
  );
}

public withStepGroups(groups: StepGroup[]): Recipe {
  return new Recipe(
    { ...this.props, stepGroups: groups, updatedAt: new Date() },
    this._id.toValue()
  );
}
```

5. Update `toObject()` method to include groups

### Priority 3: Update Application Services

**File:** `Application/Services/Recipe.service.ts`

The service needs to:
1. Accept `ingredientGroups` and `stepGroups` from the payload
2. Generate IDs for groups
3. Create `IngredientGroup` and `StepGroup` entities
4. Associate ingredients/steps with their groups via `groupId`
5. Pass groups to the Recipe entity

**Pseudo-code:**
```typescript
async createRecipe(payload: CreateRecipePayload, userId: string) {
  const recipeId = generateId();
  
  // Process ingredient groups
  let ingredientGroups: IngredientGroup[] = [];
  let allIngredients: RecipeIngredient[] = [];
  
  if (payload.ingredientGroups && payload.ingredientGroups.length > 0) {
    ingredientGroups = payload.ingredientGroups.map((group, groupIndex) => {
      const groupId = generateId();
      
      const groupIngredients = group.ingredients.map((ing, ingIndex) => 
        RecipeIngredient.create({
          recipeId,
          productId: ing.productId,
          productName: ing.productName,
          quantity: ing.quantity,
          unit: ing.unit,
          order: ing.order ?? ingIndex,
          groupId
        })
      );
      
      allIngredients.push(...groupIngredients);
      
      return IngredientGroup.create({
        recipeId,
        name: group.name,
        order: group.order ?? groupIndex,
        ingredients: groupIngredients
      }, groupId);
    });
  }
  
  // Also handle flat ingredients (for backward compat)
  if (payload.ingredients && payload.ingredients.length > 0) {
    const flatIngredients = payload.ingredients.map((ing, index) =>
      RecipeIngredient.create({
        recipeId,
        productId: ing.productId,
        productName: ing.productName,
        quantity: ing.quantity,
        unit: ing.unit,
        order: ing.order ?? index,
        groupId: ing.groupId  // May be undefined
      })
    );
    allIngredients.push(...flatIngredients);
  }
  
  // Similar logic for stepGroups and steps
  // ...
  
  const recipe = Recipe.create({
    // ... other props
    ingredients: allIngredients,
    steps: allSteps,
    ingredientGroups,
    stepGroups,
    userId
  }, recipeId);
  
  return await this.repository.save(recipe);
}
```

### Priority 4: Update API Layer

**Files:** `Api/recipes/createRecipe.api.ts`, `Api/recipes/updateRecipe.api.ts`

These should already accept the new schema (since we updated the Zod schemas). Just ensure they pass `ingredientGroups` and `stepGroups` to the service.

### Priority 5: Update UI - Recipe Form

#### A. RecipeBasicInfoStep - Multi-line Description

**File:** `Ui/RecipeForm/RecipeBasicInfoStep.tsx`

Change the description input from `Input` to `Textarea`:

```tsx
<Textarea
  label={<Trans>Description</Trans>}
  placeholder={<Trans>Enter a detailed description of your recipe</Trans>}
  value={formData.description || ""}
  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
  minRows={5}
  maxRows={15}
  className="w-full"
/>
```

#### B. RecipeIngredientsStep - Group Support

**File:** `Ui/RecipeForm/RecipeIngredientsStep.tsx`

This is a larger UI change. Add:
- State for `ingredientGroups: Array<{ name: string, ingredients: Ingredient[] }>`
- Buttons to add/remove groups
- Input for group name
- List of ingredients within each group
- Option to have ungrouped ingredients

Suggested structure:
```tsx
const [useGroups, setUseGroups] = useState(false);
const [ingredientGroups, setIngredientGroups] = useState([
  { name: "", ingredients: [] }
]);

{useGroups ? (
  <div>
    {ingredientGroups.map((group, groupIndex) => (
      <Card key={groupIndex} className="mb-4">
        <CardBody>
          <Input
            label="Group Name"
            placeholder="e.g., Pâte, Garniture"
            value={group.name}
            onChange={(e) => {
              const newGroups = [...ingredientGroups];
              newGroups[groupIndex].name = e.target.value;
              setIngredientGroups(newGroups);
            }}
          />
          
          {/* Ingredients for this group */}
          {group.ingredients.map((ing, ingIndex) => (
            // Ingredient inputs
          ))}
          
          <Button onClick={() => addIngredientToGroup(groupIndex)}>
            Add Ingredient
          </Button>
        </CardBody>
      </Card>
    ))}
    
    <Button onClick={addGroup}>Add Group</Button>
  </div>
) : (
  // Existing flat ingredient list
)}

<Button variant="ghost" onClick={() => setUseGroups(!useGroups)}>
  {useGroups ? "Remove Groups" : "Organize in Groups"}
</Button>
```

#### C. RecipeStepsStep - Group Support

**File:** `Ui/RecipeForm/RecipeStepsStep.tsx`

Similar approach as ingredients:
- Add state for `stepGroups`
- UI for adding/removing groups
- Steps within each group
- Option for ungrouped steps

### Priority 6: Update UI - Recipe Display

#### A. RecipeDetailsContainer or RecipeDetails component

**Location:** Check `Ui/RecipeDetailsContainer.tsx` or `Ui/RecipeDetails/` folder

Update the display to show groups if they exist, otherwise fall back to flat lists.

**Ingredients Section:**
```tsx
{recipe.ingredientGroups && recipe.ingredientGroups.length > 0 ? (
  <div className="space-y-6">
    {recipe.ingredientGroups.map((group) => (
      <div key={group.id}>
        <h3 className="font-semibold text-lg mb-3 text-primary">
          {group.name}
        </h3>
        <ul className="space-y-2">
          {group.ingredients.map((ing) => (
            <li key={ing.id} className="flex items-center gap-2">
              <span className="font-medium">{ing.quantity} {ing.unit}</span>
              <span>{ing.productName}</span>
            </li>
          ))}
        </ul>
      </div>
    ))}
  </div>
) : (
  // Fallback: flat list
  <ul className="space-y-2">
    {recipe.ingredients.map((ing) => (
      <li key={ing.id}>
        {ing.quantity} {ing.unit} {ing.productName}
      </li>
    ))}
  </ul>
)}
```

**Steps Section:**
```tsx
{recipe.stepGroups && recipe.stepGroups.length > 0 ? (
  <div className="space-y-6">
    {recipe.stepGroups.map((group) => (
      <div key={group.id}>
        <h3 className="font-semibold text-lg mb-3 text-primary">
          {group.name}
        </h3>
        <ol className="space-y-4">
          {group.steps.map((step) => (
            <li key={step.id} className="flex gap-3">
              <span className="font-bold text-primary">
                {step.stepNumber}.
              </span>
              <div>
                <p className="whitespace-pre-wrap">{step.description}</p>
                {step.duration && (
                  <span className="text-sm text-default-500">
                    ⏱ {step.duration} min
                  </span>
                )}
              </div>
            </li>
          ))}
        </ol>
      </div>
    ))}
  </div>
) : (
  // Fallback: flat list
  <ol className="space-y-4">
    {recipe.steps.map((step) => (
      <li key={step.id} className="flex gap-3">
        <span className="font-bold">{step.stepNumber}.</span>
        <p className="whitespace-pre-wrap">{step.description}</p>
      </li>
    ))}
  </ol>
)}
```

**Description:**
```tsx
<p className="whitespace-pre-wrap text-default-700">
  {recipe.description}
</p>
```

The `whitespace-pre-wrap` class preserves line breaks.

### Priority 7: Testing

1. **Backward Compatibility:**
   - Existing recipes should still load and display
   - Creating a recipe without groups should work

2. **New Features:**
   - Create recipe with ingredient groups
   - Create recipe with step groups
   - Edit grouped recipe
   - Display grouped recipe properly on mobile and desktop

3. **Integration:**
   - Verify pricing still works (it should, since it uses ingredients array)
   - Verify quality scoring works
   - Verify public recipes work
   - Verify search/filtering works

## Files Modified/Created Summary

### Created:
- `Domain/Entities/IngredientGroup.entity.ts`
- `Domain/Entities/StepGroup.entity.ts`
- `docs/RECIPE_GROUPS_IMPLEMENTATION.md` (this file)

### Modified:
- `prisma/schema.prisma`
- `Domain/Entities/RecipeIngredient.entity.ts`
- `Domain/Entities/RecipeStep.entity.ts`
- `Domain/Schemas/Recipe.schema.ts`
- `Infrastructure/Repositories/PrismaRecipe.infrastructure.ts` (partial)

### To be Modified:
- `Domain/Entities/Recipe.entity.ts`
- `Application/Services/Recipe.service.ts`
- `Api/recipes/createRecipe.api.ts`
- `Api/recipes/updateRecipe.api.ts`
- `Ui/RecipeForm/RecipeBasicInfoStep.tsx`
- `Ui/RecipeForm/RecipeIngredientsStep.tsx`
- `Ui/RecipeForm/RecipeStepsStep.tsx`
- `Ui/RecipeDetailsContainer.tsx` or relevant display components

## Execution Order

1. Complete Infrastructure (repository save/load/map)
2. Update Recipe entity
3. Update Application services
4. Update API layer (should be minimal)
5. Update UI forms (ingredients, steps, description)
6. Update display components
7. Test thoroughly

## Notes

- **Backward Compatibility:** The changes are designed to be backward compatible. Recipes without groups will use the flat `ingredients` and `steps` arrays.
- **Mobile-First:** All UI changes should prioritize mobile experience.
- **DDD Compliance:** All changes respect the existing DDD architecture.
- **No Breaking Changes:** Pricing and quality services should continue to work without modification.
