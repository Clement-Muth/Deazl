# Smart Recipe Builder - Photo Import Mode

## Overview
The Smart Recipe Builder now includes a Photo Import mode integrated into the recipe creation flow. Users can choose between multiple creation methods, with photo import using AI vision (Google Gemini) to extract recipe data automatically.

## Architecture

### Files Created

#### 1. Schema & Types
- **`Domain/Schemas/RecipeDraft.schema.ts`**
  - `IngredientDraftSchema`: Draft ingredient with product mapping
  - `StepDraftSchema`: Draft recipe step
  - `RecipeDraftSchema`: Complete draft recipe structure
  - `RecipeConstraintsSchema`: For AI generation constraints
  - `RecipeBuilderMode`: Type union for builder modes
  - `RecipeBuilderState`: State management interface

#### 2. API Layer
- **`Api/recipeBuilder/analyzeRecipePhoto.api.ts`**
  - Server Action using OpenRouter with Gemini 2.0 Flash (vision model)
  - Takes base64-encoded image
  - Extracts: name, subtitle, servings, times, difficulty, ingredients, steps
  - Returns structured `RecipeDraft` object
  - Handles JSON parsing and error cases

#### 3. Application Logic
- **`hooks/useRecipeFromPhoto.ts`**
  - React hook managing photo analysis workflow
  - File to base64 conversion
  - State management (loading, error, recipe)
  - Reset functionality

#### 4. UI Components
- **`Ui/RecipeBuilder/PhotoImport/PhotoCapture.tsx`**
  - Camera capture (mobile)
  - File picker (gallery)
  - HeroUI Button & Card components

- **`Ui/RecipeBuilder/PhotoImport/PhotoPreview.tsx`**
  - Image preview with Next.js Image
  - Analysis loading state
  - Remove photo option

- **`Ui/RecipeBuilder/PhotoImport/RecipePreviewCard.tsx`**
  - Displays extracted recipe data
  - Shows ingredients, steps, metadata
  - Edit and Save actions

- **`Ui/RecipeBuilder/PhotoImport/PhotoImportFlow.tsx`**
  - Orchestrates the entire flow
  - Manages state transitions
  - Error handling

#### 5. Recipe Form Integration
- **`Ui/RecipeForm/RecipeCreationModeSelection.tsx`**
  - Mode selection screen at step 0
  - 4 modes: Photo, URL (coming soon), AI (coming soon), Manual
  - Visual cards with icons and descriptions

- **`Ui/RecipeForm/PhotoImportStep.tsx`**
  - Integrated photo import within recipe form
  - Converts RecipeDraft to CreateRecipePayload
  - Seamless transition to manual editing

- **`Ui/RecipeForm/RecipeFormCreate.tsx`** (Modified)
  - Added step 0 for mode selection
  - Photo mode triggers PhotoImportStep
  - Manual mode goes directly to step 1
  - Extracted recipe data pre-fills the form

## Usage

### 1. Navigate to Recipe Creation
```
http://localhost:3001/[locale]/recipes/new
```

### 2. Complete User Flow

#### Step 0: Choose Creation Mode
1. User sees 4 options:
   - **Import from Photo** (Available) - Camera/gallery with AI extraction
   - **Import from URL** (Coming soon) - Paste recipe link
   - **Generate with AI** (Coming soon) - AI recipe generation
   - **Create Manually** (Available) - Traditional form

2. User selects "Import from Photo"

#### Photo Import Flow
3. **Capture/Select Photo**
   - Take photo with camera (mobile)
   - Choose from gallery
   - Back button returns to mode selection

4. **Preview & Analyze**
   - Preview selected image
   - Click "Analyze Recipe"
   - Loading state during AI processing

5. **Review Extracted Data**
   - View extracted recipe info
   - Preview ingredients and steps
   - Click "Use This Recipe"

6. **Manual Refinement (Steps 1-3)**
   - Pre-filled form with extracted data
   - Step 1: Basic Info (name, description, times, difficulty)
   - Step 2: Ingredients (verify product mapping, quantities)
   - Step 3: Preparation Steps (verify and refine)
   - Submit to create recipe

## Technical Details

### AI Integration
- **Models** (with automatic fallback):
  1. `google/gemini-flash-1.5` (Primary)
  2. `google/gemini-pro-1.5` (Fallback 1)
  3. `anthropic/claude-3-haiku` (Fallback 2)
  4. `openai/gpt-4o-mini` (Fallback 3)
- **Provider**: OpenRouter API
- **Capabilities**: Vision + Text generation
- **Cost**: Pay-per-use (varies by model)
- **Rate Limiting**: Automatic retry with fallback models

### Data Flow
```
User Photo → File → Base64 → Server Action → OpenRouter API → 
JSON Response → RecipeDraft → React State → UI Display
```

### Error Handling
- File validation (image types only)
- API errors with user-friendly messages
- JSON parsing fallbacks
- Network error recovery

## Next Steps

### 1. Ingredient Mapping Service
Create service to map extracted ingredient names to database products:
```typescript
// Infrastructure/Services/IngredientMapper.service.ts
- Search products by name
- Fuzzy matching
- Return productId or mark as manual entry
```

### 2. Price Calculation
Implement pricing calculation based on mapped products:
```typescript
// Application/Services/PriceCalculator.service.ts
- Calculate total price
- Price per serving
- Alternative suggestions
```

### 3. Nutrition Calculation
Calculate nutrition summary from ingredients:
```typescript
// Application/Services/NutritionCalculator.service.ts
- Aggregate nutrition facts
- Per serving calculations
```

### 4. Quality Scoring
Implement Nova score-based quality scoring:
```typescript
// Application/Services/QualityScorer.service.ts
- Analyze ingredient Nova scores
- Overall recipe quality score
```

### 5. Recipe Persistence
Create Server Action to save draft as final recipe:
```typescript
// Api/recipeBuilder/saveDraftRecipe.api.ts
- Validate RecipeDraft
- Convert to Recipe entity
- Persist to database
```

### 6. Edit Mode
Implement edit interface for corrections:
```typescript
// Ui/RecipeBuilder/PhotoImport/RecipeEditor.tsx
- Editable ingredient list
- Product search and mapping
- Step reordering
- Metadata editing
```

## Testing Recommendations

### Manual Testing
1. Test with various recipe images:
   - Printed recipes
   - Handwritten recipes
   - Recipe cards
   - Magazine pages
   - Digital screenshots

2. Edge cases:
   - Poor lighting
   - Partial recipes
   - Multiple recipes in one image
   - Non-recipe images

3. Mobile testing:
   - Camera capture
   - Gallery selection
   - Responsive layout

### Unit Testing
```typescript
// tests/useRecipeFromPhoto.test.ts
- File to base64 conversion
- State management
- Error handling

// tests/analyzeRecipePhoto.test.ts
- Mock OpenRouter responses
- JSON parsing edge cases
- Error scenarios
```

## Configuration

### Environment Variables Required
```env
OPENAI_API_KEY=sk-or-v1-xxxxx  # OpenRouter API key
```

### API Limits
- OpenRouter free tier: Check rate limits
- Gemini 2.0 Flash: Free with limits
- Image size: Optimize before sending (max 4MB recommended)

## Troubleshooting

### Common Issues

1. **"Rate limit reached"**
   - One or more AI models are temporarily overloaded
   - System automatically tries fallback models
   - If all models fail, wait 1-2 minutes and retry
   - Alternative: Use manual creation mode
   - User-friendly error message with retry options

2. **"Failed to analyze photo"**
   - Check OpenRouter API key in environment
   - Verify image is valid base64
   - Check network connectivity
   - Check OpenRouter account credits

3. **"Invalid JSON response"**
   - AI returned malformed JSON
   - System attempts to extract JSON from markdown blocks
   - Retry with clearer image
   - Try different photo angle or lighting

4. **Missing ingredients/steps**
   - Image quality too low
   - Text not clear enough
   - Try with higher resolution
   - Ensure recipe text is readable

## Performance Optimization

### Future Improvements
1. **Image Compression**: Reduce base64 size before upload
2. **Caching**: Cache analyzed recipes by image hash
3. **Batch Processing**: Support multiple images
4. **Progressive Enhancement**: Show partial results as they arrive
5. **Offline Support**: Queue analysis requests when offline

## Accessibility
- Keyboard navigation support
- Screen reader labels
- High contrast mode compatible
- Touch-friendly targets (min 44x44px)

## Mobile Optimization
- Native camera API integration
- Touch gestures for navigation
- Optimized image loading
- Reduced data transfer

---

**Status**: ✅ Photo Import Mode Complete
**Next Mode**: URL Import Mode (Mode 2)
