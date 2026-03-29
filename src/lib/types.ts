export interface Store {
  id: string;
  name: string;
  type: string;
  city: string;
  url: string;
}

export interface SaleItem {
  name: string;
  brand?: string;
  price?: string;
  comparePrice?: string;
  category?: string;
  validTo?: string;
  imageUrl?: string;
}

export interface Recipe {
  id: string;
  title: string;
  url: string;
  imageUrl?: string;
  rating?: number;
  cookingTime?: string;
  difficulty?: string;
}

export interface MatchedRecipe extends Recipe {
  matchedItems: string[];
  reasoning: string;
}

export type FoodPreference =
  | "asian"
  | "italian"
  | "swedish"
  | "mexican"
  | "indian"
  | "vegan"
  | "vegetarian"
  | "gluten-free"
  | "quick-meals"
  | "budget";

export interface FoodPreferenceOption {
  id: FoodPreference;
  label: string;
  emoji: string;
}

export const FOOD_PREFERENCES: FoodPreferenceOption[] = [
  { id: "asian", label: "Asiatiskt", emoji: "\u{1F35C}" },
  { id: "italian", label: "Italienskt", emoji: "\u{1F35D}" },
  { id: "swedish", label: "Svenskt", emoji: "\u{1F1F8}\u{1F1EA}" },
  { id: "mexican", label: "Mexikanskt", emoji: "\u{1F32E}" },
  { id: "indian", label: "Indiskt", emoji: "\u{1F35B}" },
  { id: "vegan", label: "Veganskt", emoji: "\u{1F331}" },
  { id: "vegetarian", label: "Vegetariskt", emoji: "\u{1F966}" },
  { id: "gluten-free", label: "Glutenfritt", emoji: "\u{1F33E}" },
  { id: "quick-meals", label: "Snabblagat", emoji: "\u{23F1}\u{FE0F}" },
  { id: "budget", label: "Budgetv\u00E4nligt", emoji: "\u{1F4B0}" },
];
