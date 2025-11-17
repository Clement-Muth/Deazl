import { prisma } from "@deazl/system";

const categories = [
  { name: "Appetizer", slug: "appetizer", description: "Starters and appetizers", icon: "🥗" },
  { name: "Main Course", slug: "main-course", description: "Main dishes", icon: "🍽️" },
  { name: "Dessert", slug: "dessert", description: "Sweet treats", icon: "🍰" },
  { name: "Snack", slug: "snack", description: "Quick bites", icon: "🥪" },
  { name: "Breakfast", slug: "breakfast", description: "Morning meals", icon: "🥞" },
  { name: "Beverage", slug: "beverage", description: "Drinks", icon: "🥤" }
];

const tags = [
  { name: "vegan", slug: "vegan", color: "#22c55e" },
  { name: "vegetarian", slug: "vegetarian", color: "#84cc16" },
  { name: "gluten-free", slug: "gluten-free", color: "#f59e0b" },
  { name: "dairy-free", slug: "dairy-free", color: "#3b82f6" },
  { name: "healthy", slug: "healthy", color: "#10b981" },
  { name: "quick", slug: "quick", color: "#ef4444" },
  { name: "low-calorie", slug: "low-calorie", color: "#8b5cf6" },
  { name: "high-protein", slug: "high-protein", color: "#ec4899" },
  { name: "keto", slug: "keto", color: "#f97316" },
  { name: "paleo", slug: "paleo", color: "#14b8a6" }
];

const cuisines = [
  "italian",
  "french",
  "asian",
  "mexican",
  "american",
  "mediterranean",
  "indian",
  "japanese",
  "chinese",
  "thai"
];

async function seedRecipeHub() {
  console.log("🌱 Starting Recipe Hub seed...");

  // Seed Categories
  console.log("Creating categories...");
  for (const category of categories) {
    await prisma.recipeCategory.upsert({
      where: { slug: category.slug },
      update: category,
      create: category
    });
  }
  console.log(`✅ Created ${categories.length} categories`);

  // Seed Tags
  console.log("Creating tags...");
  for (const tag of tags) {
    await prisma.recipeTag.upsert({
      where: { slug: tag.slug },
      update: tag,
      create: tag
    });
  }
  console.log(`✅ Created ${tags.length} tags`);

  // Get first user for sample recipes
  const firstUser = await prisma.user.findFirst();
  if (!firstUser) {
    console.log("⚠️  No users found, skipping recipe creation");
    return;
  }

  console.log("Creating sample recipes...");
  
  // Create generic products for ingredients (simplified)
  const getOrCreateProduct = async (name: string, description: string) => {
    const existing = await prisma.product.findFirst({ where: { name } });
    if (existing) return existing;
    return prisma.product.create({
      data: { name, description, barcode: `SEED-${Date.now()}-${Math.random()}` }
    });
  };

  const spaghetti = await getOrCreateProduct("Spaghetti", "Italian pasta");
  const eggs = await getOrCreateProduct("Eggs", "Fresh eggs");
  const parmesan = await getOrCreateProduct("Parmesan Cheese", "Grated Parmesan");
  const pancetta = await getOrCreateProduct("Pancetta", "Italian bacon");
  const tomatoes = await getOrCreateProduct("Tomatoes", "Fresh tomatoes");
  const feta = await getOrCreateProduct("Feta Cheese", "Greek feta");
  const olives = await getOrCreateProduct("Olives", "Black olives");
  const cucumber = await getOrCreateProduct("Cucumber", "Fresh cucumber");
  const oliveOil = await getOrCreateProduct("Olive Oil", "Extra virgin olive oil");
  const avocado = await getOrCreateProduct("Avocado", "Fresh avocado");
  const bread = await getOrCreateProduct("Bread", "Whole grain bread");

  const sampleRecipes = [
    {
      name: "Classic Spaghetti Carbonara",
      description: "Traditional Italian pasta with creamy egg sauce, pancetta, and Parmesan",
      difficulty: "MEDIUM" as const,
      preparationTime: 10,
      cookingTime: 15,
      servings: 4,
      category: "main-course",
      cuisine: "italian",
      isPublic: true,
      userId: firstUser.id,
      ingredients: [
        { productId: spaghetti.id, quantity: 400, unit: "g", order: 0 },
        { productId: eggs.id, quantity: 4, unit: "unit", order: 1 },
        { productId: parmesan.id, quantity: 100, unit: "g", order: 2 },
        { productId: pancetta.id, quantity: 150, unit: "g", order: 3 }
      ],
      steps: [
        { stepNumber: 1, description: "Bring a large pot of salted water to boil. Add spaghetti and cook according to package instructions until al dente.", duration: 10 },
        { stepNumber: 2, description: "While pasta cooks, dice the pancetta and cook in a large pan over medium heat until crispy, about 5 minutes.", duration: 5 },
        { stepNumber: 3, description: "In a bowl, whisk together eggs, grated Parmesan, and black pepper.", duration: 2 },
        { stepNumber: 4, description: "Drain pasta, reserving 1 cup of pasta water. Add hot pasta to the pan with pancetta.", duration: 1 },
        { stepNumber: 5, description: "Remove from heat and quickly stir in egg mixture, adding pasta water as needed to create a creamy sauce. Serve immediately.", duration: 2 }
      ]
    },
    {
      name: "Greek Salad",
      description: "Fresh Mediterranean salad with feta, olives, and vegetables",
      difficulty: "EASY" as const,
      preparationTime: 15,
      cookingTime: 0,
      servings: 4,
      category: "appetizer",
      cuisine: "greek",
      isPublic: true,
      userId: firstUser.id,
      ingredients: [
        { productId: tomatoes.id, quantity: 4, unit: "unit", order: 0 },
        { productId: cucumber.id, quantity: 1, unit: "unit", order: 1 },
        { productId: feta.id, quantity: 200, unit: "g", order: 2 },
        { productId: olives.id, quantity: 100, unit: "g", order: 3 },
        { productId: oliveOil.id, quantity: 50, unit: "ml", order: 4 }
      ],
      steps: [
        { stepNumber: 1, description: "Chop tomatoes and cucumber into bite-sized pieces.", duration: 5 },
        { stepNumber: 2, description: "Combine vegetables in a large bowl with olives and crumbled feta.", duration: 3 },
        { stepNumber: 3, description: "Drizzle with olive oil, season with salt, pepper, and oregano. Toss gently and serve.", duration: 2 }
      ]
    },
    {
      name: "Chocolate Lava Cake",
      description: "Decadent dessert with molten chocolate center",
      difficulty: "HARD" as const,
      preparationTime: 20,
      cookingTime: 12,
      servings: 2,
      category: "dessert",
      cuisine: "french",
      isPublic: true,
      userId: firstUser.id,
      ingredients: [
        { productId: eggs.id, quantity: 2, unit: "unit", order: 0 }
      ],
      steps: [
        { stepNumber: 1, description: "Preheat oven to 220°C (425°F). Butter two ramekins and dust with cocoa powder.", duration: 5 },
        { stepNumber: 2, description: "Melt chocolate and butter in a double boiler. Whisk eggs and sugar until thick.", duration: 8 },
        { stepNumber: 3, description: "Fold chocolate mixture into eggs, add flour. Pour into ramekins.", duration: 4 },
        { stepNumber: 4, description: "Bake for 12 minutes until edges are set but center is soft. Let cool for 1 minute, then invert onto plates.", duration: 13 }
      ]
    },
    {
      name: "Avocado Toast",
      description: "Healthy breakfast with mashed avocado and toppings",
      difficulty: "EASY" as const,
      preparationTime: 5,
      cookingTime: 2,
      servings: 1,
      category: "breakfast",
      cuisine: "american",
      isPublic: true,
      userId: firstUser.id,
      ingredients: [
        { productId: bread.id, quantity: 2, unit: "slices", order: 0 },
        { productId: avocado.id, quantity: 1, unit: "unit", order: 1 }
      ],
      steps: [
        { stepNumber: 1, description: "Toast bread slices until golden brown.", duration: 2 },
        { stepNumber: 2, description: "Mash avocado with a fork, add salt, pepper, and lemon juice.", duration: 2 },
        { stepNumber: 3, description: "Spread avocado on toast. Top with optional toppings like eggs, tomatoes, or seeds.", duration: 1 }
      ]
    },
    {
      name: "Thai Green Curry",
      description: "Aromatic curry with coconut milk and vegetables",
      difficulty: "MEDIUM" as const,
      preparationTime: 15,
      cookingTime: 25,
      servings: 4,
      category: "main-course",
      cuisine: "thai",
      isPublic: true,
      userId: firstUser.id,
      ingredients: [
        { productId: tomatoes.id, quantity: 2, unit: "unit", order: 0 }
      ],
      steps: [
        { stepNumber: 1, description: "Heat oil in a large pan. Add curry paste and cook for 1-2 minutes.", duration: 2 },
        { stepNumber: 2, description: "Add coconut milk and bring to a simmer. Add vegetables and cook for 15 minutes.", duration: 15 },
        { stepNumber: 3, description: "Season with fish sauce and sugar. Serve with rice and fresh basil.", duration: 3 }
      ]
    },
    {
      name: "Chicken Tacos",
      description: "Soft tacos with seasoned chicken and fresh toppings",
      difficulty: "EASY" as const,
      preparationTime: 10,
      cookingTime: 15,
      servings: 4,
      category: "main-course",
      cuisine: "mexican",
      isPublic: true,
      userId: firstUser.id,
      ingredients: [
        { productId: tomatoes.id, quantity: 2, unit: "unit", order: 0 }
      ],
      steps: [
        { stepNumber: 1, description: "Season chicken with taco spices and cook in a pan until done, about 12 minutes.", duration: 12 },
        { stepNumber: 2, description: "Warm tortillas. Dice chicken and prepare toppings (lettuce, tomatoes, cheese, sour cream).", duration: 5 },
        { stepNumber: 3, description: "Assemble tacos with chicken and desired toppings. Serve with lime wedges.", duration: 3 }
      ]
    },
    {
      name: "Berry Smoothie Bowl",
      description: "Refreshing breakfast bowl with mixed berries and granola",
      difficulty: "EASY" as const,
      preparationTime: 10,
      cookingTime: 0,
      servings: 1,
      category: "breakfast",
      cuisine: "american",
      isPublic: true,
      userId: firstUser.id,
      ingredients: [
        { productId: eggs.id, quantity: 1, unit: "unit", order: 0 }
      ],
      steps: [
        { stepNumber: 1, description: "Blend frozen berries, banana, and yogurt until smooth and thick.", duration: 3 },
        { stepNumber: 2, description: "Pour into a bowl. Top with granola, fresh berries, chia seeds, and honey.", duration: 5 },
        { stepNumber: 3, description: "Serve immediately while cold.", duration: 1 }
      ]
    },
    {
      name: "Beef Stir-Fry",
      description: "Quick Asian-style beef with vegetables and soy sauce",
      difficulty: "MEDIUM" as const,
      preparationTime: 15,
      cookingTime: 10,
      servings: 3,
      category: "main-course",
      cuisine: "asian",
      isPublic: true,
      userId: firstUser.id,
      ingredients: [
        { productId: oliveOil.id, quantity: 30, unit: "ml", order: 0 }
      ],
      steps: [
        { stepNumber: 1, description: "Slice beef thinly against the grain. Marinate with soy sauce, ginger, and garlic.", duration: 10 },
        { stepNumber: 2, description: "Heat wok on high heat. Stir-fry beef in batches until browned, set aside.", duration: 5 },
        { stepNumber: 3, description: "Stir-fry vegetables, add beef back, toss with sauce. Serve over rice.", duration: 5 }
      ]
    },
    {
      name: "Caprese Salad",
      description: "Classic Italian salad with tomato, mozzarella, and basil",
      difficulty: "EASY" as const,
      preparationTime: 10,
      cookingTime: 0,
      servings: 2,
      category: "appetizer",
      cuisine: "italian",
      isPublic: true,
      userId: firstUser.id,
      ingredients: [
        { productId: tomatoes.id, quantity: 3, unit: "unit", order: 0 },
        { productId: oliveOil.id, quantity: 30, unit: "ml", order: 1 }
      ],
      steps: [
        { stepNumber: 1, description: "Slice tomatoes and mozzarella into thick rounds.", duration: 5 },
        { stepNumber: 2, description: "Arrange alternating slices on a plate. Add fresh basil leaves between slices.", duration: 3 },
        { stepNumber: 3, description: "Drizzle with olive oil and balsamic. Season with salt and pepper.", duration: 2 }
      ]
    },
    {
      name: "Banana Bread",
      description: "Moist and sweet bread made with ripe bananas",
      difficulty: "EASY" as const,
      preparationTime: 15,
      cookingTime: 60,
      servings: 8,
      category: "dessert",
      cuisine: "american",
      isPublic: true,
      userId: firstUser.id,
      ingredients: [
        { productId: eggs.id, quantity: 2, unit: "unit", order: 0 }
      ],
      steps: [
        { stepNumber: 1, description: "Preheat oven to 175°C (350°F). Mash bananas in a bowl.", duration: 5 },
        { stepNumber: 2, description: "Mix in melted butter, sugar, egg, and vanilla. Add flour, baking soda, and salt.", duration: 8 },
        { stepNumber: 3, description: "Pour into greased loaf pan. Bake for 60 minutes until golden.", duration: 60 },
        { stepNumber: 4, description: "Cool in pan for 10 minutes, then turn out onto a wire rack.", duration: 10 }
      ]
    }
  ];

  for (const recipeData of sampleRecipes) {
    const existing = await prisma.recipe.findFirst({
      where: { name: recipeData.name }
    });

    if (!existing) {
      const { ingredients, steps, ...baseRecipe } = recipeData;
      const recipe = await prisma.recipe.create({
        data: baseRecipe
      });

      // Create ingredients
      if (ingredients && ingredients.length > 0) {
        await Promise.all(
          ingredients.map((ing) =>
            prisma.recipeIngredient.create({
              data: {
                recipeId: recipe.id,
                productId: ing.productId,
                quantity: ing.quantity,
                unit: ing.unit,
                order: ing.order
              }
            })
          )
        );
      }

      // Create steps
      if (steps && steps.length > 0) {
        await Promise.all(
          steps.map((step) =>
            prisma.recipeStep.create({
              data: {
                recipeId: recipe.id,
                stepNumber: step.stepNumber,
                description: step.description,
                duration: step.duration
              }
            })
          )
        );
      }
    }
  }
  console.log(`✅ Created ${sampleRecipes.length} sample recipes with ingredients and steps`);

  console.log("✅ Trending scores will be calculated by the background job");

  console.log("🎉 Recipe Hub seed completed!");
}

seedRecipeHub()
  .catch((error) => {
    console.error("❌ Error seeding database:", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
