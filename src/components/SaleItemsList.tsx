"use client";

import type { SaleItem } from "@/lib/types";

interface SaleItemsListProps {
  items: SaleItem[];
  loading: boolean;
}

export default function SaleItemsList({ items, loading }: SaleItemsListProps) {
  if (loading) {
    return (
      <div className="bg-white rounded-2xl shadow-lg p-5 border-2 border-green-200">
        <div className="animate-pulse">
          <div className="h-5 bg-green-100 rounded w-32 mb-3" />
          <div className="space-y-2">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-4 bg-green-50 rounded w-full" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (items.length === 0) return null;

  return (
    <div className="bg-white rounded-2xl shadow-lg p-5 border-2 border-green-200">
      <div className="flex items-center gap-2 mb-3">
        <span className="text-lg">🏷️</span>
        <h3 className="text-sm font-bold text-gray-600 uppercase tracking-wider">
          Varor p&aring; REA ({items.length} st)
        </h3>
      </div>
      <div className="flex flex-wrap gap-1.5 max-h-40 overflow-y-auto">
        {items.map((item, i) => (
          <span
            key={i}
            className="inline-flex items-center gap-1 px-2.5 py-1 bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-full text-sm text-green-800"
          >
            {item.name}
            {item.price && (
              <span className="text-xs font-bold text-green-600">
                {item.price}
              </span>
            )}
          </span>
        ))}
      </div>
    </div>
  );
}
