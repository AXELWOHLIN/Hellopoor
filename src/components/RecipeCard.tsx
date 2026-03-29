"use client";

import type { MatchedRecipe } from "@/lib/types";
import FavoriteButton from "./FavoriteButton";

interface RecipeCardProps {
  recipe: MatchedRecipe;
  isFavorite: boolean;
  onToggleFavorite: (recipe: MatchedRecipe) => void;
}

const CARD_COLORS = [
  "from-pink-400 to-rose-400",
  "from-purple-400 to-indigo-400",
  "from-blue-400 to-cyan-400",
  "from-teal-400 to-emerald-400",
  "from-green-400 to-lime-400",
  "from-yellow-400 to-orange-400",
  "from-orange-400 to-red-400",
  "from-rose-400 to-pink-400",
];

export default function RecipeCard({
  recipe,
  isFavorite: isFav,
  onToggleFavorite,
}: RecipeCardProps) {
  const colorIndex =
    parseInt(recipe.id.replace(/\D/g, "") || "0") % CARD_COLORS.length;

  return (
    <div className="group bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden border-2 border-gray-100 hover:border-purple-200 hover:-translate-y-1">
      {/* Color banner */}
      <div
        className={`h-3 bg-gradient-to-r ${CARD_COLORS[colorIndex]}`}
      />

      <div className="p-5">
        <div className="flex items-start justify-between gap-2 mb-3">
          <h3 className="font-bold text-gray-800 text-lg leading-tight group-hover:text-purple-600 transition-colors">
            {recipe.title}
          </h3>
          <FavoriteButton
            isFavorite={isFav}
            onClick={() => onToggleFavorite(recipe)}
          />
        </div>

        {recipe.reasoning && (
          <p className="text-sm text-gray-500 mb-3 italic">
            {recipe.reasoning}
          </p>
        )}

        {recipe.matchedItems.length > 0 && (
          <div className="mb-4">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1.5">
              Matchade REA-varor
            </p>
            <div className="flex flex-wrap gap-1.5">
              {recipe.matchedItems.map((item, i) => (
                <span
                  key={i}
                  className="px-2 py-0.5 bg-gradient-to-r from-green-100 to-emerald-100 text-green-700 rounded-full text-xs font-medium"
                >
                  {item}
                </span>
              ))}
            </div>
          </div>
        )}

        {(recipe.cookingTime || recipe.rating) && (
          <div className="flex items-center gap-3 mb-3 text-sm text-gray-500">
            {recipe.cookingTime && (
              <span className="flex items-center gap-1">
                ⏱️ {recipe.cookingTime}
              </span>
            )}
            {recipe.rating && (
              <span className="flex items-center gap-1">
                ⭐ {recipe.rating}
              </span>
            )}
          </div>
        )}

        <a
          href={recipe.url}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl text-sm font-bold hover:from-purple-600 hover:to-pink-600 transition-all shadow-md hover:shadow-lg"
        >
          Se recept p&aring; ICA
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
            />
          </svg>
        </a>
      </div>
    </div>
  );
}
