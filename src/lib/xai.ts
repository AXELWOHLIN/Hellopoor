import type { SaleItem, Recipe, MatchedRecipe, FoodPreference } from "./types";

const XAI_API_URL = "https://api.x.ai/v1/chat/completions";

interface MatchRequest {
  saleItems: SaleItem[];
  recipes: Recipe[];
  preferences: FoodPreference[];
}

export async function matchRecipes({
  saleItems,
  recipes,
  preferences,
}: MatchRequest): Promise<MatchedRecipe[]> {
  const apiKey = process.env.XAI_API_KEY;
  if (!apiKey) {
    throw new Error("XAI_API_KEY environment variable is not set");
  }

  const saleItemsList = saleItems
    .map((item) => {
      const parts = [item.name];
      if (item.brand) parts.push(`(${item.brand})`);
      if (item.price) parts.push(`- ${item.price}`);
      return parts.join(" ");
    })
    .join("\n");

  const recipesList = recipes
    .map((r) => `- ID: ${r.id} | "${r.title}" | ${r.url}`)
    .join("\n");

  const preferencesText =
    preferences.length > 0
      ? `\n\nThe user prefers these types of food: ${preferences.join(", ")}. Prioritize recipes that match these preferences.`
      : "";

  const systemPrompt = `You are a Swedish recipe matching assistant for the app "Hello Poor". Your job is to match recipes from ICA with items currently on sale at the user's local ICA store.

Analyze the sale items and recipe titles. Return the 8-12 best matching recipes where the sale items would be key ingredients.${preferencesText}

You MUST respond with valid JSON in this exact format:
{
  "matches": [
    {
      "id": "recipe_id",
      "title": "Recipe Title",
      "url": "recipe_url",
      "matchedItems": ["sale item 1", "sale item 2"],
      "reasoning": "Brief explanation of why this recipe matches the sale items"
    }
  ]
}

Only include recipes from the provided list. Use the exact id, title, and url from the list.`;

  const userPrompt = `Here are the items currently on sale:
${saleItemsList}

Here are available recipes:
${recipesList}

Find the best matching recipes where the sale items would be useful ingredients.`;

  const res = await fetch(XAI_API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: "grok-2-latest",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      temperature: 0.3,
      response_format: { type: "json_object" },
    }),
  });

  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`XAI API error (${res.status}): ${errorText}`);
  }

  const data = await res.json();
  const content = data.choices?.[0]?.message?.content;

  if (!content) {
    throw new Error("No response content from XAI API");
  }

  const parsed = JSON.parse(content);
  const matches: MatchedRecipe[] = (parsed.matches || []).map(
    (m: Record<string, unknown>) => {
      // Find the original recipe to get image URL etc.
      const original = recipes.find((r) => r.id === String(m.id));
      return {
        id: String(m.id),
        title: (m.title as string) || original?.title || "",
        url: (m.url as string) || original?.url || "",
        imageUrl: original?.imageUrl,
        rating: original?.rating,
        cookingTime: original?.cookingTime,
        difficulty: original?.difficulty,
        matchedItems: (m.matchedItems as string[]) || [],
        reasoning: (m.reasoning as string) || "",
      };
    }
  );

  return matches;
}
