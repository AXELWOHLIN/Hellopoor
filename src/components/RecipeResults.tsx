"use client";

import type { MatchedRecipe } from "@/lib/types";
import RecipeCard from "./RecipeCard";

interface RecipeResultsProps {
  recipes: MatchedRecipe[];
  loading: boolean;
  error: string | null;
  isFavorite: (id: string) => boolean;
  onToggleFavorite: (recipe: MatchedRecipe) => void;
}

export default function RecipeResults({
  recipes,
  loading,
  error,
  isFavorite,
  onToggleFavorite,
}: RecipeResultsProps) {
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-16">
        <div className="relative">
          <div className="w-16 h-16 border-4 border-purple-200 rounded-full animate-spin border-t-purple-500" />
          <span className="absolute inset-0 flex items-center justify-center text-2xl animate-bounce">
            🍳
          </span>
        </div>
        <p className="mt-4 text-gray-500 font-medium animate-pulse">
          Letar efter de b&auml;sta recepten f&ouml;r dig...
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 rounded-2xl p-6 text-center border-2 border-red-200">
        <span className="text-4xl mb-2 block">😢</span>
        <p className="text-red-600 font-medium">{error}</p>
        <p className="text-red-400 text-sm mt-1">
          F&ouml;rs&ouml;k igen eller v&auml;lj en annan butik
        </p>
      </div>
    );
  }

  if (recipes.length === 0) {
    return null;
  }

  return (
    <div>
      <div className="flex items-center gap-2 mb-6">
        <span className="text-2xl">✨</span>
        <h2 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
          Dina receptmatchningar
        </h2>
        <span className="ml-2 px-2 py-0.5 bg-purple-100 text-purple-600 rounded-full text-sm font-bold">
          {recipes.length} recept
        </span>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {recipes.map((recipe) => (
          <RecipeCard
            key={recipe.id}
            recipe={recipe}
            isFavorite={isFavorite(recipe.id)}
            onToggleFavorite={onToggleFavorite}
          />
        ))}
      </div>
    </div>
  );
}
