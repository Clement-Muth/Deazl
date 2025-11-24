# Recipe Groups Implementation - Remaining Tasks

## ✅ Completed

1. **Prisma Schema** - Added `IngredientGroup` and `StepGroup` models with proper relations
2. **Domain Entities** - Created `IngredientGroup.entity.ts` and `StepGroup.entity.ts`
3. **RecipeIngredient & RecipeStep** - Added `groupId` support with `withGroup()` methods
4. **Schemas** - Updated `Recipe.schema.ts` with group schemas and validation
5. **Repository** - Started updating `PrismaRecipe.infrastructure.ts` with include statements

## 🚧 Remaining Work

### 1. Complete Infrastructure Repository (`PrismaRecipe.infrastructure.ts`)

The `save()` method needs to handle ingredient and step groups. Add before/after the existing ingredient/step saves:

```typescript
async save(recipe: Recipe): Promise<Recipe> {
  // In the transaction, add:
  
  // Delete existing groups
  await tx.ingredientGroup.deleteMany({
    where: { recipeId: recipe.id }
  });
  
  await tx.stepGroup.deleteMany({
    where: { recipeId: recipe.id }
  });
  
  // Create ingredient groups if any
  if (recipe.ingredientGroups && recipe.ingredientGroups.length > 0) {
    for (const group of recipe.ingredientGroups) {
      await tx.ingredientGroup.create({
        data: {
          id: group.id,
          recipeId: recipe.id,
          name: group.name,
          order: group.order
        }
      });
    }
  }
  
  // Create step groups if any  
  if (recipe.stepGroups && recipe.stepGroups.length > 0) {
    for (const group of recipe.stepGroups) {
      await tx.stepGroup.create({
        data: {
          id: group.id,
          recipeId: recipe.id,
          name: group.name,
          order: group.order
        }
      });
    }
  }
  
  // When creating ingredients, include groupId:
  await tx.recipeIngredient.createMany({
    data: recipe.ingredients.map((ing) => ({
      id: ing.id,
      recipeId: recipe.id,
      productId: ing.productId,
      quantity: ing.quantity,
      unit: ing.unit,
      order: ing.order,
      groupId: ing.groupId ?? null
    }))
  });
  
  // When creating steps, include groupId:
  await tx.recipeStep.createMany({
    data: recipe.steps.map((step) => ({
      id: step.id,
      recipeId: recipe.id,
      stepNumber: step.stepNumber,
      description: step.description,
      duration: step.duration ?? null,
      groupId: step.groupId ?? null
    }))
  });
}
```

### 2. Update Recipe Entity (`Recipe.entity.ts`)

Add ingredient groups and step groups to the entity:

```typescript
interface RecipeProps {
  // ... existing props
  ingredients: RecipeIngredient[];
  steps: RecipeStep[];
  ingredientGroups?: IngredientGroup[];
  stepGroups?: StepGroup[];
  // ... rest
}

// Add getters:
get ingredientGroups(): IngredientGroup[] {
  return this.props.ingredientGroups || [];
}

get stepGroups(): StepGroup[] {
  return this.props.stepGroups || [];
}

// Add with methods:
public withIngredientGroups(groups: IngredientGroup[]): Recipe {
  return new Recipe({ ...this.props, ingredientGroups: groups, updatedAt: new Date() }, this._id.toValue());
}

public withStepGroups(groups: StepGroup[]): Recipe {
  return new Recipe({ ...this.props, stepGroups: groups, updatedAt: new Date() }, this._id.toValue());
}
```

### 3. Update `mapToDomain()` in Repository

Map the groups from Prisma to domain entities:

```typescript
public mapToDomain(recipeData: any): Recipe {
  // ... existing ingredient and step mapping
  
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
    // ... existing props
    ingredients,
    steps,
    ingredientGroups,
    stepGroups
  }, recipeData.id);
}
```

### 4. Update All Query Methods

Add the same include for groups to all methods:
- `findManyByUserId`
- `findManyPublic`
- `searchPublicRecipes`
- `findByShareToken`
- `findRecentPublicRecipes`
- `findPublicRecipesByCategory/Cuisine/Tag`
- `checkUserAccess`

### 5. Update Application Services

#### `Recipe.service.ts`

Update create/update methods to handle groups from the payload:

```typescript
async createRecipe(payload: CreateRecipePayload, userId: string): Promise<Recipe> {
  // Process ingredientGroups if present
  const ingredientGroups = payload.ingredientGroups?.map((group, index) => {
    const groupId = generateId();
    const groupIngredients = group.ingredients.map((ing, ingIndex) => 
      RecipeIngredient.create({
        recipeId: recipe.id,
        productId: ing.productId,
        productName: ing.productName,
        quantity: ing.quantity,
        unit: ing.unit,
        order: ing.order ?? ingIndex,
        groupId
      })
    );
    
    return IngredientGroup.create({
      recipeId: recipe.id,
      name: group.name,
      order: group.order ?? index,
      ingredients: groupIngredients
    }, groupId);
  });
  
  // Similar for stepGroups
  
  const recipe = Recipe.create({
    // ... existing props
    ingredientGroups: ingredientGroups || [],
    stepGroups: stepGroups || []
  });
}
```

### 6. Update API Layer

#### `createRecipe.api.ts` & `updateRecipe.api.ts`

Accept `ingredientGroups` and `stepGroups` from the form and pass to service.

### 7. Update UI Components

#### `RecipeIngredientsStep.tsx`

Add UI for managing ingredient groups:
- Button to "Add Group"
- Each group has a name input + list of ingredients
- Drag-and-drop to reorder groups
- Within each group, manage ingredients as before

Suggested structure:
```tsx
{ingredientGroups.map((group, groupIndex) => (
  <div key={groupIndex} className="mb-6">
    <Input
      label="Group Name"
      value={group.name}
      onChange={(e) => updateGroupName(groupIndex, e.target.value)}
      placeholder="e.g., Pâte, Garniture"
    />
    {group.ingredients.map((ingredient, ingIndex) => (
      // Ingredient inputs
    ))}
    <Button onClick={() => addIngredientToGroup(groupIndex)}>
      Add Ingredient
    </Button>
  </div>
))}
```

#### `RecipeStepsStep.tsx`

Similar approach for step groups.

#### `RecipeBasicInfoStep.tsx`

Change description field to textarea with better height:

```tsx
<Textarea
  label="Description"
  value={formData.description}
  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
  placeholder="Enter a detailed description with multiple paragraphs..."
  minRows={5}
  maxRows={15}
/>
```

### 8. Update Display Components

#### `RecipeDetailsContainer.tsx` or equivalent

Render groups properly:

```tsx
{/* Ingredient Groups */}
{recipe.ingredientGroups && recipe.ingredientGroups.length > 0 ? (
  recipe.ingredientGroups.map((group) => (
    <div key={group.id} className="mb-6">
      <h3 className="font-semibold text-lg mb-2">{group.name}</h3>
      <ul>
        {group.ingredients.map((ing) => (
          <li key={ing.id}>
            {ing.quantity} {ing.unit} {ing.productName}
          </li>
        ))}
      </ul>
    </div>
  ))
) : (
  // Fallback: render flat ingredients list
  <ul>
    {recipe.ingredients.map((ing) => (
      <li key={ing.id}>{ing.quantity} {ing.unit} {ing.productName}</li>
    ))}
  </ul>
)}

{/* Step Groups */}
{recipe.stepGroups && recipe.stepGroups.length > 0 ? (
  recipe.stepGroups.map((group) => (
    <div key={group.id} className="mb-6">
      <h3 className="font-semibold text-lg mb-2">{group.name}</h3>
      <ol>
        {group.steps.map((step) => (
          <li key={step.id} className="mb-3">
            <p>{step.description}</p>
            {step.duration && <span className="text-sm">{step.duration} min</span>}
          </li>
        ))}
      </ol>
    </div>
  ))
) : (
  // Fallback: render flat steps
  <ol>
    {recipe.steps.map((step) => (
      <li key={step.id}>{step.description}</li>
    ))}
  </ol>
)}

{/* Description with line breaks */}
<div className="whitespace-pre-wrap">
  {recipe.description}
</div>
```

### 9. Description Formatting

The `description` field is already set to `@db.Text` in Prisma, so it supports multi-line.

For rendering, use `whitespace-pre-wrap` CSS class to preserve line breaks, or convert `\n` to `<br />` in React.

## Migration Note

Since this is a backward-compatible change (groups are optional), existing recipes without groups will continue to work with the flat `ingredients` and `steps` arrays.

## Testing Checklist

- [ ] Create recipe without groups (backward compat)
- [ ] Create recipe with ingredient groups only
- [ ] Create recipe with step groups only
- [ ] Create recipe with both groups
- [ ] Edit recipe and change groups
- [ ] Display grouped recipe on mobile
- [ ] Verify pricing still works
- [ ] Verify quality scoring still works
- [ ] Verify public recipe pages work
- [ ] Verify search/filters work

## Priority

1. Complete repository save/load logic
2. Update Recipe entity
3. Update application services
4. Update API layer
5. Update UI forms
6. Update display components
7. Test thoroughly
