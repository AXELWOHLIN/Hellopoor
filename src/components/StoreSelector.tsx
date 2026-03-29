"use client";

import { useState, useEffect, useMemo } from "react";
import type { Store } from "@/lib/types";

interface StoreSelectorProps {
  onStoreSelect: (store: Store) => void;
  selectedStore: Store | null;
}

export default function StoreSelector({
  onStoreSelect,
  selectedStore,
}: StoreSelectorProps) {
  const [stores, setStores] = useState<Store[]>([]);
  const [search, setSearch] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadStores() {
      try {
        const res = await fetch("/api/stores");
        if (!res.ok) throw new Error("Failed to load stores");
        const data = await res.json();
        setStores(data.stores || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load stores");
      } finally {
        setLoading(false);
      }
    }
    loadStores();
  }, []);

  const filtered = useMemo(() => {
    if (!search.trim()) return stores.slice(0, 50);
    const q = search.toLowerCase();
    return stores
      .filter(
        (s) =>
          s.name.toLowerCase().includes(q) ||
          s.city.toLowerCase().includes(q) ||
          s.type.toLowerCase().includes(q)
      )
      .slice(0, 50);
  }, [stores, search]);

  const storeTypeColor = (type: string) => {
    switch (type.toLowerCase()) {
      case "maxi":
        return "bg-red-100 text-red-700";
      case "kvantum":
        return "bg-blue-100 text-blue-700";
      case "supermarket":
        return "bg-green-100 text-green-700";
      case "nara":
        return "bg-yellow-100 text-yellow-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-2xl shadow-lg p-6 border-2 border-purple-200">
        <div className="animate-pulse flex items-center gap-3">
          <div className="w-8 h-8 bg-purple-200 rounded-full" />
          <div className="h-6 bg-purple-100 rounded-lg w-48" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 rounded-2xl shadow-lg p-6 border-2 border-red-200">
        <p className="text-red-600 font-medium">{error}</p>
      </div>
    );
  }

  return (
    <div className="relative">
      <div
        className="bg-white rounded-2xl shadow-lg p-4 border-2 border-purple-200 hover:border-purple-400 transition-colors cursor-pointer"
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="flex items-center gap-3">
          <span className="text-2xl">🏪</span>
          {selectedStore ? (
            <div className="flex items-center gap-2 flex-1">
              <span className="font-bold text-gray-800">
                {selectedStore.name}
              </span>
              <span
                className={`text-xs px-2 py-0.5 rounded-full font-medium ${storeTypeColor(selectedStore.type)}`}
              >
                {selectedStore.type}
              </span>
              <span className="text-sm text-gray-500">
                {selectedStore.city}
              </span>
            </div>
          ) : (
            <span className="text-gray-400 font-medium">
              V&auml;lj din ICA-butik...
            </span>
          )}
          <svg
            className={`w-5 h-5 text-purple-400 transition-transform ${isOpen ? "rotate-180" : ""}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 9l-7 7-7-7"
            />
          </svg>
        </div>
      </div>

      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-2xl border-2 border-purple-200 z-50 overflow-hidden">
          <div className="p-3 border-b border-purple-100">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="S&ouml;k butik eller ort..."
              className="w-full px-4 py-2 rounded-xl bg-purple-50 border border-purple-200 focus:outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-200 text-gray-800 placeholder-gray-400"
              autoFocus
            />
          </div>
          <div className="max-h-64 overflow-y-auto">
            {filtered.length === 0 ? (
              <p className="p-4 text-gray-400 text-center">
                Inga butiker hittades
              </p>
            ) : (
              filtered.map((store) => (
                <button
                  key={store.id}
                  className="w-full px-4 py-3 text-left hover:bg-purple-50 transition-colors flex items-center gap-2 border-b border-gray-50 last:border-0"
                  onClick={() => {
                    onStoreSelect(store);
                    setIsOpen(false);
                    setSearch("");
                  }}
                >
                  <span className="font-medium text-gray-800 flex-1">
                    {store.name}
                  </span>
                  <span
                    className={`text-xs px-2 py-0.5 rounded-full font-medium ${storeTypeColor(store.type)}`}
                  >
                    {store.type}
                  </span>
                  <span className="text-sm text-gray-400">{store.city}</span>
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
