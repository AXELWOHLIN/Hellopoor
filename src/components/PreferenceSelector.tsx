"use client";

import type { FoodPreference } from "@/lib/types";
import { FOOD_PREFERENCES } from "@/lib/types";

interface PreferenceSelectorProps {
  selected: FoodPreference[];
  onChange: (preferences: FoodPreference[]) => void;
}

export default function PreferenceSelector({
  selected,
  onChange,
}: PreferenceSelectorProps) {
  const toggle = (pref: FoodPreference) => {
    if (selected.includes(pref)) {
      onChange(selected.filter((p) => p !== pref));
    } else {
      onChange([...selected, pref]);
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg p-5 border-2 border-orange-200">
      <h3 className="text-sm font-bold text-gray-600 uppercase tracking-wider mb-3">
        Matpreferenser
      </h3>
      <div className="flex flex-wrap gap-2">
        {FOOD_PREFERENCES.map((pref) => {
          const isSelected = selected.includes(pref.id);
          return (
            <button
              key={pref.id}
              onClick={() => toggle(pref.id)}
              className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all transform hover:scale-105 ${
                isSelected
                  ? "bg-gradient-to-r from-orange-400 to-pink-400 text-white shadow-md"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              <span className="mr-1">{pref.emoji}</span>
              {pref.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
