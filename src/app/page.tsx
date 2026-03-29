"use client";

import { useState, useCallback } from "react";
import type { Store, SaleItem, Recipe, MatchedRecipe, FoodPreference } from "@/lib/types";
import StoreSelector from "@/components/StoreSelector";
import PreferenceSelector from "@/components/PreferenceSelector";
import SaleItemsList from "@/components/SaleItemsList";
import RecipeResults from "@/components/RecipeResults";
import { useFavorites } from "@/hooks/useFavorites";
import Link from "next/link";

export default function Home() {
  const [selectedStore, setSelectedStore] = useState<Store | null>(null);
  const [preferences, setPreferences] = useState<FoodPreference[]>([]);
  const [saleItems, setSaleItems] = useState<SaleItem[]>([]);
  const [matchedRecipes, setMatchedRecipes] = useState<MatchedRecipe[]>([]);
  const [loadingOffers, setLoadingOffers] = useState(false);
  const [loadingMatch, setLoadingMatch] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toggleFavorite, isFavorite, favorites } = useFavorites();

  const handleStoreSelect = useCallback(
    async (store: Store) => {
      setSelectedStore(store);
      setError(null);
      setMatchedRecipes([]);
      setLoadingOffers(true);

      try {
        // Fetch offers and recipes in parallel
        const [offersRes, recipesRes] = await Promise.all([
          fetch(`/api/offers?storeId=${store.id}`),
          fetch("/api/recipes"),
        ]);

        if (!offersRes.ok) throw new Error("Kunde inte h\u00E4mta erbjudanden");
        if (!recipesRes.ok) throw new Error("Kunde inte h\u00E4mta recept");

        const [offersData, recipesData] = await Promise.all([
          offersRes.json(),
          recipesRes.json(),
        ]);

        const offers: SaleItem[] = offersData.offers || [];
        const recipes: Recipe[] = recipesData.recipes || [];

        setSaleItems(offers);
        setLoadingOffers(false);

        if (offers.length === 0) {
          setError("Inga erbjudanden hittades f\u00F6r denna butik just nu");
          return;
        }

        if (recipes.length === 0) {
          setError("Inga recept kunde h\u00E4mtas fr\u00E5n ICA");
          return;
        }

        // Now match with LLM
        setLoadingMatch(true);
        const matchRes = await fetch("/api/match", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            saleItems: offers,
            recipes: recipes.slice(0, 200), // Limit to avoid huge prompts
            preferences,
          }),
        });

        if (!matchRes.ok) {
          const errData = await matchRes.json();
          throw new Error(errData.error || "Matchning misslyckades");
        }

        const matchData = await matchRes.json();
        setMatchedRecipes(matchData.matches || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : "N\u00E5got gick fel");
        setSaleItems([]);
      } finally {
        setLoadingOffers(false);
        setLoadingMatch(false);
      }
    },
    [preferences]
  );

  const handleFindRecipes = useCallback(async () => {
    if (!selectedStore || saleItems.length === 0) return;

    setLoadingMatch(true);
    setError(null);

    try {
      const recipesRes = await fetch("/api/recipes");
      if (!recipesRes.ok) throw new Error("Kunde inte h\u00E4mta recept");
      const recipesData = await recipesRes.json();
      const recipes: Recipe[] = recipesData.recipes || [];

      const matchRes = await fetch("/api/match", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          saleItems,
          recipes: recipes.slice(0, 200),
          preferences,
        }),
      });

      if (!matchRes.ok) {
        const errData = await matchRes.json();
        throw new Error(errData.error || "Matchning misslyckades");
      }

      const matchData = await matchRes.json();
      setMatchedRecipes(matchData.matches || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "N\u00E5got gick fel");
    } finally {
      setLoadingMatch(false);
    }
  }, [selectedStore, saleItems, preferences]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-orange-50">
      {/* Header */}
      <header className="bg-gradient-to-r from-purple-600 via-pink-500 to-orange-400 text-white shadow-xl">
        <div className="max-w-6xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-black tracking-tight">
                Hello Poor! 👋💸
              </h1>
              <p className="text-purple-100 mt-1 text-lg">
                Hitta recept som matchar dina ICA-erbjudanden
              </p>
            </div>
            <Link
              href="/favorites"
              className="flex items-center gap-2 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-xl hover:bg-white/30 transition-colors"
            >
              <span className="text-xl">❤️</span>
              <span className="font-bold">Favoriter</span>
              {favorites.length > 0 && (
                <span className="bg-white text-purple-600 text-xs font-bold px-2 py-0.5 rounded-full">
                  {favorites.length}
                </span>
              )}
            </Link>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="max-w-6xl mx-auto px-4 py-8 space-y-6">
        {/* Store selector */}
        <StoreSelector
          onStoreSelect={handleStoreSelect}
          selectedStore={selectedStore}
        />

        {/* Preferences */}
        <PreferenceSelector
          selected={preferences}
          onChange={(newPrefs) => {
            setPreferences(newPrefs);
          }}
        />

        {/* Re-match button when preferences change and we already have results */}
        {selectedStore && saleItems.length > 0 && !loadingMatch && (
          <div className="flex justify-center">
            <button
              onClick={handleFindRecipes}
              className="px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-2xl font-bold text-lg shadow-lg hover:shadow-xl hover:from-purple-600 hover:to-pink-600 transition-all transform hover:scale-105"
            >
              🔍 Hitta recept!
            </button>
          </div>
        )}

        {/* Sale items */}
        <SaleItemsList items={saleItems} loading={loadingOffers} />

        {/* Results */}
        <RecipeResults
          recipes={matchedRecipes}
          loading={loadingMatch}
          error={error}
          isFavorite={isFavorite}
          onToggleFavorite={toggleFavorite}
        />

        {/* Empty state */}
        {!selectedStore && !loadingOffers && !loadingMatch && (
          <div className="text-center py-16">
            <span className="text-6xl mb-4 block">🛒</span>
            <h2 className="text-2xl font-bold text-gray-600 mb-2">
              V&auml;lj din ICA-butik f&ouml;r att b&ouml;rja!
            </h2>
            <p className="text-gray-400 max-w-md mx-auto">
              Vi hittar veckans erbjudanden och matchar dem med l&auml;ckra
              recept s&aring; att du kan laga god mat till budgetpris.
            </p>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="mt-auto py-6 text-center text-gray-400 text-sm">
        <p>
          Hello Poor &mdash; Laga gott, spara pengar 💰
        </p>
      </footer>
    </div>
  );
}
