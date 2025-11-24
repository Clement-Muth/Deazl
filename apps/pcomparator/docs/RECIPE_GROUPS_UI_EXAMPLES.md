# Recipe Groups - UI Implementation Examples

## 1. RecipeBasicInfoStep.tsx - Description Multi-ligne

### Change à faire:

**Avant:**
```tsx
<Input
  label={<Trans>Description</Trans>}
  placeholder={<Trans>Recipe description</Trans>}
  value={formData.description || ""}
  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
/>
```

**Après:**
```tsx
import { Textarea } from "@heroui/react";

<Textarea
  label={<Trans>Description</Trans>}
  placeholder={<Trans>Entrez une description détaillée de votre recette...</Trans>}
  value={formData.description || ""}
  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
  minRows={5}
  maxRows={15}
  description={<Trans>Vous pouvez utiliser plusieurs paragraphes</Trans>}
/>
```

## 2. RecipeDetailsContainer.tsx - Display avec Groupes

### Ingrédients Section:

```tsx
{/* Ingredients Section */}
<div className="mb-8">
  <h2 className="text-2xl font-bold mb-4">
    <Trans>Ingrédients</Trans>
  </h2>
  
  {recipe.ingredientGroups && recipe.ingredientGroups.length > 0 ? (
    // Mode Groupé
    <div className="space-y-6">
      {recipe.ingredientGroups
        .sort((a, b) => a.order - b.order)
        .map((group) => (
          <div key={group.id} className="border-l-4 border-primary pl-4">
            <h3 className="text-lg font-semibold mb-3 text-primary">
              {group.name}
            </h3>
            <ul className="space-y-2">
              {group.ingredients
                .sort((a, b) => a.order - b.order)
                .map((ing) => (
                  <li key={ing.id} className="flex items-center gap-2">
                    <span className="w-2 h-2 bg-primary rounded-full" />
                    <span className="font-medium">
                      {ing.quantity} {ing.unit}
                    </span>
                    <span>{ing.productName}</span>
                  </li>
                ))}
            </ul>
          </div>
        ))}
    </div>
  ) : (
    // Mode Flat (Fallback pour backward compatibility)
    <ul className="space-y-2">
      {recipe.ingredients
        .sort((a, b) => a.order - b.order)
        .map((ing) => (
          <li key={ing.id} className="flex items-center gap-2">
            <span className="w-2 h-2 bg-default-400 rounded-full" />
            <span className="font-medium">
              {ing.quantity} {ing.unit}
            </span>
            <span>{ing.productName}</span>
          </li>
        ))}
    </ul>
  )}
</div>
```

### Steps Section:

```tsx
{/* Steps Section */}
<div className="mb-8">
  <h2 className="text-2xl font-bold mb-4">
    <Trans>Préparation</Trans>
  </h2>
  
  {recipe.stepGroups && recipe.stepGroups.length > 0 ? (
    // Mode Groupé
    <div className="space-y-8">
      {recipe.stepGroups
        .sort((a, b) => a.order - b.order)
        .map((group) => (
          <div key={group.id} className="border-l-4 border-secondary pl-4">
            <h3 className="text-lg font-semibold mb-4 text-secondary">
              {group.name}
            </h3>
            <ol className="space-y-4">
              {group.steps
                .sort((a, b) => a.stepNumber - b.stepNumber)
                .map((step) => (
                  <li key={step.id} className="flex gap-3">
                    <span className="flex-shrink-0 w-8 h-8 rounded-full bg-secondary/20 flex items-center justify-center font-bold text-secondary">
                      {step.stepNumber}
                    </span>
                    <div className="flex-1">
                      <p className="whitespace-pre-wrap leading-relaxed">
                        {step.description}
                      </p>
                      {step.duration && (
                        <div className="mt-2 text-sm text-default-500 flex items-center gap-1">
                          <ClockIcon className="w-4 h-4" />
                          <span>{step.duration} min</span>
                        </div>
                      )}
                    </div>
                  </li>
                ))}
            </ol>
          </div>
        ))}
    </div>
  ) : (
    // Mode Flat (Fallback)
    <ol className="space-y-4">
      {recipe.steps
        .sort((a, b) => a.stepNumber - b.stepNumber)
        .map((step) => (
          <li key={step.id} className="flex gap-3">
            <span className="flex-shrink-0 w-8 h-8 rounded-full bg-default-200 flex items-center justify-center font-bold">
              {step.stepNumber}
            </span>
            <div className="flex-1">
              <p className="whitespace-pre-wrap leading-relaxed">
                {step.description}
              </p>
              {step.duration && (
                <div className="mt-2 text-sm text-default-500">
                  ⏱ {step.duration} min
                </div>
              )}
            </div>
          </li>
        ))}
    </ol>
  )}
</div>
```

### Description Section:

```tsx
{/* Description Section */}
{recipe.description && (
  <div className="mb-8">
    <h2 className="text-2xl font-bold mb-4">
      <Trans>Description</Trans>
    </h2>
    <p className="text-default-700 whitespace-pre-wrap leading-relaxed">
      {recipe.description}
    </p>
  </div>
)}
```

## 3. RecipeIngredientsStep.tsx - Formulaire avec Groupes

### État et Types:

```tsx
import { v4 as uuidv4 } from "uuid";

interface IngredientGroupForm {
  id?: string;
  name: string;
  order: number;
  ingredients: Array<{
    productId: string;
    productName?: string;
    quantity: number;
    unit: string;
    order: number;
  }>;
}

const [useGroups, setUseGroups] = useState(false);
const [ingredientGroups, setIngredientGroups] = useState<IngredientGroupForm[]>([
  { name: "", order: 0, ingredients: [] }
]);
const [flatIngredients, setFlatIngredients] = useState<any[]>([]);
```

### Toggle UI:

```tsx
<div className="mb-4">
  <Button
    variant={useGroups ? "solid" : "bordered"}
    color="primary"
    onClick={() => setUseGroups(!useGroups)}
    startContent={useGroups ? <FolderIcon /> : <ListIcon />}
  >
    {useGroups ? (
      <Trans>Passer en mode simple</Trans>
    ) : (
      <Trans>Organiser en groupes</Trans>
    )}
  </Button>
</div>
```

### Mode Groupé UI:

```tsx
{useGroups ? (
  <div className="space-y-6">
    {ingredientGroups.map((group, groupIndex) => (
      <Card key={groupIndex} className="p-4">
        <div className="flex items-center gap-2 mb-4">
          <Input
            label={<Trans>Nom du groupe</Trans>}
            placeholder="ex: Pâte, Garniture, Sauce"
            value={group.name}
            onChange={(e) => {
              const newGroups = [...ingredientGroups];
              newGroups[groupIndex].name = e.target.value;
              setIngredientGroups(newGroups);
            }}
            className="flex-1"
            isRequired
          />
          
          {ingredientGroups.length > 1 && (
            <Button
              isIconOnly
              color="danger"
              variant="light"
              onClick={() => {
                const newGroups = ingredientGroups.filter((_, i) => i !== groupIndex);
                setIngredientGroups(newGroups);
              }}
            >
              <TrashIcon className="w-5 h-5" />
            </Button>
          )}
        </div>
        
        <Divider className="my-4" />
        
        <div className="space-y-3">
          {group.ingredients.map((ing, ingIndex) => (
            <div key={ingIndex} className="flex gap-2">
              <SmartIngredientInput
                value={ing}
                onChange={(newIng) => {
                  const newGroups = [...ingredientGroups];
                  newGroups[groupIndex].ingredients[ingIndex] = newIng;
                  setIngredientGroups(newGroups);
                }}
                onRemove={() => {
                  const newGroups = [...ingredientGroups];
                  newGroups[groupIndex].ingredients.splice(ingIndex, 1);
                  setIngredientGroups(newGroups);
                }}
              />
            </div>
          ))}
        </div>
        
        <Button
          variant="flat"
          color="primary"
          onClick={() => {
            const newGroups = [...ingredientGroups];
            newGroups[groupIndex].ingredients.push({
              productId: "",
              quantity: 0,
              unit: "g",
              order: group.ingredients.length
            });
            setIngredientGroups(newGroups);
          }}
          startContent={<PlusIcon />}
          className="mt-3"
        >
          <Trans>Ajouter un ingrédient</Trans>
        </Button>
      </Card>
    ))}
    
    <Button
      variant="bordered"
      color="primary"
      onClick={() => {
        setIngredientGroups([
          ...ingredientGroups,
          {
            name: "",
            order: ingredientGroups.length,
            ingredients: []
          }
        ]);
      }}
      startContent={<PlusIcon />}
    >
      <Trans>Ajouter un groupe</Trans>
    </Button>
  </div>
) : (
  // Mode flat existant
  <div className="space-y-3">
    {flatIngredients.map((ing, index) => (
      <SmartIngredientInput
        key={index}
        value={ing}
        onChange={(newIng) => {
          const newIngs = [...flatIngredients];
          newIngs[index] = newIng;
          setFlatIngredients(newIngs);
        }}
        onRemove={() => {
          setFlatIngredients(flatIngredients.filter((_, i) => i !== index));
        }}
      />
    ))}
    
    <Button
      variant="flat"
      onClick={() => {
        setFlatIngredients([
          ...flatIngredients,
          { productId: "", quantity: 0, unit: "g", order: flatIngredients.length }
        ]);
      }}
      startContent={<PlusIcon />}
    >
      <Trans>Ajouter un ingrédient</Trans>
    </Button>
  </div>
)}
```

### Submission:

```tsx
const handleSubmit = () => {
  const payload = {
    ...formData,
    ...(useGroups
      ? {
          ingredientGroups: ingredientGroups.map((group, index) => ({
            name: group.name,
            order: index,
            ingredients: group.ingredients.map((ing, ingIndex) => ({
              productId: ing.productId,
              productName: ing.productName,
              quantity: ing.quantity,
              unit: ing.unit,
              order: ingIndex
            }))
          }))
        }
      : {
          ingredients: flatIngredients.map((ing, index) => ({
            ...ing,
            order: index
          }))
        })
  };
  
  onSubmit(payload);
};
```

## 4. RecipeStepsStep.tsx - Similaire aux Ingrédients

```tsx
interface StepGroupForm {
  id?: string;
  name: string;
  order: number;
  steps: Array<{
    stepNumber: number;
    description: string;
    duration?: number;
  }>;
}

const [useStepGroups, setUseStepGroups] = useState(false);
const [stepGroups, setStepGroups] = useState<StepGroupForm[]>([
  { name: "", order: 0, steps: [] }
]);

// UI très similaire à RecipeIngredientsStep mais pour les steps
// Remplacer SmartIngredientInput par des inputs pour description/duration
```

## 5. Mobile-Specific Considerations

### Collapsible Groups (Optionnel mais recommandé):

```tsx
import { Accordion, AccordionItem } from "@heroui/react";

<Accordion variant="splitted">
  {recipe.ingredientGroups.map((group) => (
    <AccordionItem
      key={group.id}
      title={group.name}
      subtitle={`${group.ingredients.length} ingrédients`}
    >
      <ul className="space-y-2">
        {group.ingredients.map((ing) => (
          <li key={ing.id}>
            {ing.quantity} {ing.unit} {ing.productName}
          </li>
        ))}
      </ul>
    </AccordionItem>
  ))}
</Accordion>
```

### Touch-Friendly Buttons:

```tsx
<Button
  isIconOnly
  size="lg"  // Larger touch target
  className="min-w-12 min-h-12"
  // ...
>
  <TrashIcon />
</Button>
```

## 6. Styling Recommandations

### Tailwind Classes Utiles:

```tsx
// Groups
className="border-l-4 border-primary pl-4"  // Sidebar coloré

// Cards
className="rounded-lg border-2 border-default-200 p-4"

// Spacing
className="space-y-6"  // Entre groupes
className="space-y-2"  // Dans un groupe

// Text
className="whitespace-pre-wrap"  // Pour description multi-ligne
className="leading-relaxed"  // Meilleur line-height

// Icons/Bullets
className="w-2 h-2 bg-primary rounded-full"
```

### Dark Mode Compatible:

```tsx
className="bg-default-100 dark:bg-default-50"
className="text-default-700 dark:text-default-300"
className="border-default-200 dark:border-default-800"
```

## 7. Validation

### Dans le Form:

```tsx
const validateGroups = () => {
  if (useGroups) {
    // Tous les groupes doivent avoir un nom
    const hasEmptyNames = ingredientGroups.some(g => !g.name.trim());
    if (hasEmptyNames) {
      toast.error("Tous les groupes doivent avoir un nom");
      return false;
    }
    
    // Au moins un groupe doit avoir des ingrédients
    const hasIngredients = ingredientGroups.some(g => g.ingredients.length > 0);
    if (!hasIngredients) {
      toast.error("Au moins un groupe doit contenir des ingrédients");
      return false;
    }
  }
  
  return true;
};
```

## 8. Migration Path (Édition de Recettes Existantes)

```tsx
useEffect(() => {
  // Si la recette a des groupes, activer le mode groupé
  if (recipe.ingredientGroups && recipe.ingredientGroups.length > 0) {
    setUseGroups(true);
    setIngredientGroups(recipe.ingredientGroups.map(g => ({
      id: g.id,
      name: g.name,
      order: g.order,
      ingredients: g.ingredients
    })));
  } else {
    // Sinon charger les ingrédients flat
    setFlatIngredients(recipe.ingredients || []);
  }
}, [recipe]);
```

## 9. Testing Checklist UI

```tsx
// Tests manuels à faire:
// ✓ Toggle entre mode simple et groupé
// ✓ Ajouter un groupe
// ✓ Renommer un groupe
// ✓ Supprimer un groupe (sauf si dernier)
// ✓ Ajouter ingrédient dans groupe
// ✓ Supprimer ingrédient de groupe
// ✓ Soumettre formulaire avec groupes
// ✓ Affichage sur mobile (responsive)
// ✓ Éditer recette existante avec groupes
// ✓ Éditer recette existante sans groupes
// ✓ Description multi-ligne s'affiche correctement
```

## 10. Icônes Recommandées (lucide-react)

```tsx
import {
  FolderIcon,      // Pour groupes
  ListIcon,        // Pour liste plate
  PlusIcon,        // Ajouter
  TrashIcon,       // Supprimer
  GripVerticalIcon, // Drag handle (si réordonnancement)
  ClockIcon,       // Durée
  ChefHatIcon      // Pour section recette
} from "lucide-react";
```

---

Avec ces exemples, tu as tout le code nécessaire pour implémenter la partie UI ! 🎨✨
