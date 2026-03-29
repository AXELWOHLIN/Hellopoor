"use client";

import { useFavorites } from "@/hooks/useFavorites";
import RecipeCard from "@/components/RecipeCard";
import Link from "next/link";

export default function FavoritesPage() {
  const { favorites, toggleFavorite, isFavorite } = useFavorites();

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-orange-50">
      {/* Header */}
      <header className="bg-gradient-to-r from-purple-600 via-pink-500 to-orange-400 text-white shadow-xl">
        <div className="max-w-6xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-black tracking-tight">
                ❤️ Favoriter
              </h1>
              <p className="text-purple-100 mt-1 text-lg">
                Dina sparade recept
              </p>
            </div>
            <Link
              href="/"
              className="flex items-center gap-2 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-xl hover:bg-white/30 transition-colors"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M10 19l-7-7m0 0l7-7m-7 7h18"
                />
              </svg>
              <span className="font-bold">Tillbaka</span>
            </Link>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-6xl mx-auto px-4 py-8">
        {favorites.length === 0 ? (
          <div className="text-center py-16">
            <span className="text-6xl mb-4 block">💔</span>
            <h2 className="text-2xl font-bold text-gray-600 mb-2">
              Inga favoriter &auml;nnu
            </h2>
            <p className="text-gray-400 max-w-md mx-auto mb-6">
              N&auml;r du hittar recept du gillar, klicka p&aring; hj&auml;rtat
              f&ouml;r att spara dem h&auml;r.
            </p>
            <Link
              href="/"
              className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-2xl font-bold shadow-lg hover:shadow-xl transition-all"
            >
              🔍 Hitta recept
            </Link>
          </div>
        ) : (
          <div>
            <p className="text-gray-500 mb-6">
              {favorites.length} sparade recept
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {favorites.map((recipe) => (
                <RecipeCard
                  key={recipe.id}
                  recipe={recipe}
                  isFavorite={isFavorite(recipe.id)}
                  onToggleFavorite={toggleFavorite}
                />
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
