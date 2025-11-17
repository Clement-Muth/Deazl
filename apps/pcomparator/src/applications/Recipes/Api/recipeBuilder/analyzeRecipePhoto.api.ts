"use server";

import type { RecipeDraft } from "../../Domain/Schemas/RecipeDraft.schema";

export interface AnalyzePhotoResult {
  success: boolean;
  recipe?: Partial<RecipeDraft>;
  error?: string;
  rawText?: string;
}

const VISION_MODELS = [
  "google/gemini-flash-1.5",
  "google/gemini-pro-1.5",
  "anthropic/claude-3-haiku",
  "openai/gpt-4o-mini"
];

async function tryAnalyzeWithModel(
  apiKey: string,
  model: string,
  imageBase64: string,
  prompt: string
): Promise<{ success: boolean; data?: any; error?: string }> {
  try {
    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model,
        messages: [
          {
            role: "user",
            content: [
              {
                type: "image_url",
                image_url: {
                  url: `data:image/jpeg;base64,${imageBase64}`
                }
              },
              {
                type: "text",
                text: prompt
              }
            ]
          }
        ],
        temperature: 0.1,
        max_tokens: 2000
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      let errorData: any;
      try {
        errorData = JSON.parse(errorText);
      } catch {
        errorData = { error: { message: errorText } };
      }

      const errorMessage = errorData.error?.message || errorText;
      const isRateLimit = response.status === 429 || errorMessage.includes("rate-limited");

      return {
        success: false,
        error: isRateLimit ? "RATE_LIMIT" : errorMessage
      };
    }

    const data = await response.json();
    return { success: true, data };
  } catch (error: any) {
    return {
      success: false,
      error: error.message
    };
  }
}

export async function analyzeRecipePhoto(imageBase64: string): Promise<AnalyzePhotoResult> {
  try {
    const apiKey = process.env.OPENROUTER_API_KEY;
    if (!apiKey) {
      return {
        success: false,
        error: "OpenRouter API key not configured"
      };
    }

    const estimatedSizeMB = (imageBase64.length * 0.75) / 1024 / 1024;
    console.log(`Received base64 image: ${imageBase64.length} chars, ~${estimatedSizeMB.toFixed(2)}MB`);

    if (estimatedSizeMB > 8) {
      return {
        success: false,
        error: `Image too large (${estimatedSizeMB.toFixed(1)}MB). Please use a smaller image or compress it more.`
      };
    }

    const prompt = `You are a recipe extraction expert. Analyze this recipe image and extract all information in a structured JSON format.

Extract:
- Recipe name (required)
- Subtitle or description
- Number of servings
- Preparation time (in minutes)
- Cooking time (in minutes)
- Difficulty level (EASY, MEDIUM, or HARD)
- List of ingredients with:
  * Product name
  * Quantity (as number)
  * Unit (use EXACTLY one of: unit, piece, g, kg, ml, cl, l, teaspoon, tablespoon, cup, pinch)
    - "cas" or "c. à soupe" or "cuillère à soupe" → use "tablespoon"
    - "cac" or "c. à café" or "cuillère à café" → use "teaspoon"
    - "pincée" → use "pinch"
    - "tasse" → use "cup"
    - numbers without unit → use "unit"
- Cooking steps with:
  * Step number
  * Description
  * Duration if mentioned (in minutes)

Return ONLY valid JSON with this structure:
{
  "name": "Recipe Name",
  "subtitle": "Optional subtitle",
  "servings": 4,
  "preparationTime": 15,
  "cookingTime": 30,
  "difficulty": "EASY",
  "ingredients": [
    {"productName": "Flour", "quantity": 500, "unit": "g"},
    {"productName": "Eggs", "quantity": 3, "unit": "unit"},
    {"productName": "Sugar", "quantity": 2, "unit": "tablespoon"}
  ],
  "steps": [
    {"stepNumber": 1, "description": "Mix flour and eggs", "duration": 5}
  ]
}

IMPORTANT: Use lowercase unit names exactly as specified above. Ensure quantities are numbers, not strings.`;

    let lastError = "Unknown error";
    let responseData: any = null;

    for (const model of VISION_MODELS) {
      const result = await tryAnalyzeWithModel(apiKey, model, imageBase64, prompt);

      if (result.success && result.data) {
        responseData = result.data;
        break;
      }

      if (result.error === "RATE_LIMIT") {
        console.log(`Model ${model} rate limited, trying next...`);
        lastError = "Rate limit reached. Please try again in a few moments.";
        continue;
      }

      lastError = result.error || "Unknown error";
      console.error(`Model ${model} failed:`, lastError);
    }

    if (!responseData) {
      return {
        success: false,
        error: lastError
      };
    }

    const content = responseData.choices[0]?.message?.content?.trim();

    if (!content) {
      return {
        success: false,
        error: "No content received from AI"
      };
    }

    let extractedData: any;
    try {
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        extractedData = JSON.parse(jsonMatch[0]);
      } else {
        extractedData = JSON.parse(content);
      }
    } catch (parseError) {
      return {
        success: false,
        error: "Failed to parse AI response as JSON",
        rawText: content
      };
    }

    const recipeDraft: Partial<RecipeDraft> = {
      name: extractedData.name || "Untitled Recipe",
      subtitle: extractedData.subtitle,
      description: extractedData.description,
      servings: extractedData.servings || 4,
      preparationTime: extractedData.preparationTime || 30,
      cookingTime: extractedData.cookingTime || 30,
      difficulty: extractedData.difficulty || "EASY",
      ingredients: (extractedData.ingredients || []).map((ing: any, index: number) => ({
        productName: ing.productName || ing.name,
        quantity: Number(ing.quantity) || 1,
        unit: ing.unit || "unit",
        order: index,
        isManualEntry: true
      })),
      steps: (extractedData.steps || []).map((step: any) => ({
        stepNumber: step.stepNumber || step.number,
        description: step.description,
        duration: step.duration || null
      })),
      source: "photo" as const,
      tags: extractedData.tags || []
    };

    return {
      success: true,
      recipe: recipeDraft
    };
  } catch (error: any) {
    console.error("Error analyzing recipe photo:", error);
    return {
      success: false,
      error: error.message || "Failed to analyze recipe photo"
    };
  }
}
