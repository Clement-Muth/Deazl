"use server";

import { z } from "zod";

const GenerateDescriptionSchema = z.object({
  recipeName: z.string().min(1),
  difficulty: z.enum(["EASY", "MEDIUM", "HARD"]).optional(),
  preparationTime: z.number().optional(),
  cookingTime: z.number().optional(),
  servings: z.number().optional()
});

type GenerateDescriptionPayload = z.infer<typeof GenerateDescriptionSchema>;

export async function generateRecipeDescription(
  params: GenerateDescriptionPayload
): Promise<{ success: true; description: string } | { success: false; error: string }> {
  try {
    const payload = GenerateDescriptionSchema.parse(params);

    const apiKey = process.env.OPENROUTER_API_KEY;
    if (!apiKey) {
      return { success: false, error: "OpenRouter API key not configured" };
    }

    // Construire le prompt en fonction des informations disponibles
    let prompt = `Écris une courte description appétissante (2-3 phrases) pour une recette appelée "${payload.recipeName}".`;

    if (payload.difficulty) {
      const difficultyText =
        payload.difficulty === "EASY" ? "facile" : payload.difficulty === "MEDIUM" ? "moyenne" : "difficile";
      prompt += ` C’est une recette ${difficultyText}.`;
    }

    if (payload.preparationTime || payload.cookingTime) {
      const totalTime = (payload.preparationTime || 0) + (payload.cookingTime || 0);
      prompt += ` Elle prend environ ${totalTime} minutes à préparer.`;
    }

    if (payload.servings) {
      prompt += ` Elle permet de servir ${payload.servings} personnes.`;
    }

    prompt +=
      " Mets en avant ce qui rend cette recette spéciale, ses saveurs, et pourquoi on aurait envie de la cuisiner. Sois chaleureux et engageant.";

    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "meta-llama/llama-3-8b-instruct",
        messages: [
          {
            role: "system",
            content: `
              Tu es un rédacteur culinaire français.
              Écris une description appétissante et vivante (3 à 5 phrases) d’une recette, en mettant en avant ses saveurs, son ambiance, et pourquoi on voudrait la cuisiner.
              Le ton doit être chaleureux et un peu poétique, sans liste d’ingrédients.
              Répond toujours en français.
            `
          },
          {
            role: "user",
            content: prompt
          }
        ],
        temperature: 0.8,
        max_tokens: 300
      })
    });

    if (!response.ok) {
      const error = await response.text();
      console.error("OpenRouter API error:", error);
      return { success: false, error: "Failed to generate description" };
    }

    const data = await response.json();
    const rawDescription = data.choices[0]?.message?.content?.trim() ?? "";
    const description = rawDescription
      .replace(/^<s>\s*\[OUT\]\s*/i, "")
      .replace(/<\/s>$/i, "")
      .trim();

    if (!description) {
      return { success: false, error: "No description generated" };
    }

    return { success: true, description };
  } catch (error) {
    console.error("Error generating description:", error);
    return { success: false, error: "An error occurred while generating the description" };
  }
}
