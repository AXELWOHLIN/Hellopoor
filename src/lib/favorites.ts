import type { MatchedRecipe } from "./types";

const STORAGE_KEY = "hellopoor-favorites";

export function getFavorites(): MatchedRecipe[] {
  if (typeof window === "undefined") return [];
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

export function saveFavorite(recipe: MatchedRecipe): void {
  const favorites = getFavorites();
  if (!favorites.find((f) => f.id === recipe.id)) {
    favorites.push(recipe);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(favorites));
  }
}

export function removeFavorite(recipeId: string): void {
  const favorites = getFavorites().filter((f) => f.id !== recipeId);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(favorites));
}

export function isFavorite(recipeId: string): boolean {
  return getFavorites().some((f) => f.id === recipeId);
}
