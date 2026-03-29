"use client";

import { useState, useEffect, useCallback } from "react";
import type { MatchedRecipe } from "@/lib/types";
import {
  getFavorites,
  saveFavorite,
  removeFavorite,
  isFavorite,
} from "@/lib/favorites";

export function useFavorites() {
  const [favorites, setFavorites] = useState<MatchedRecipe[]>([]);

  useEffect(() => {
    setFavorites(getFavorites());
  }, []);

  const toggleFavorite = useCallback((recipe: MatchedRecipe) => {
    if (isFavorite(recipe.id)) {
      removeFavorite(recipe.id);
    } else {
      saveFavorite(recipe);
    }
    setFavorites(getFavorites());
  }, []);

  const checkIsFavorite = useCallback(
    (recipeId: string) => favorites.some((f) => f.id === recipeId),
    [favorites]
  );

  return { favorites, toggleFavorite, isFavorite: checkIsFavorite };
}
