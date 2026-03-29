import * as cheerio from "cheerio";
import type { Store, SaleItem, Recipe } from "./types";

const ICA_BASE = "https://www.ica.se";

function extractInitialData(html: string): Record<string, unknown> | null {
  const $ = cheerio.load(html);
  let data: Record<string, unknown> | null = null;

  $("script").each((_, el) => {
    const content = $(el).html() || "";
    const match = content.match(
      /window\.__INITIAL_DATA__\s*=\s*(\{[\s\S]*?\});?\s*(?:<\/script>|$)/
    );
    if (match) {
      try {
        data = JSON.parse(match[1]);
      } catch {
        // Try cleaning trailing semicolons or whitespace
        try {
          data = JSON.parse(match[1].replace(/;?\s*$/, ""));
        } catch {
          // Couldn't parse
        }
      }
    }
  });

  return data;
}

export async function fetchStores(): Promise<Store[]> {
  const res = await fetch(`${ICA_BASE}/butiker/`, {
    headers: {
      "User-Agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
      Accept: "text/html,application/xhtml+xml",
    },
    next: { revalidate: 86400 }, // cache for 24h
  });

  if (!res.ok) throw new Error(`Failed to fetch stores: ${res.status}`);

  const html = await res.text();
  const $ = cheerio.load(html);
  const stores: Store[] = [];

  // Parse store links from the butiker page
  $('a[href*="/butiker/"]').each((_, el) => {
    const href = $(el).attr("href") || "";
    const match = href.match(
      /\/butiker\/(nara|maxi|supermarket|kvantum)\/([^/]+)\/([^/]+)\/?$/
    );
    if (match) {
      const [, type, city, slug] = match;
      const name =
        $(el).text().trim() ||
        slug
          .replace(/-\d+$/, "")
          .replace(/-/g, " ")
          .replace(/\b\w/g, (c) => c.toUpperCase());
      const idMatch = slug.match(/(\d+)$/);
      const id = idMatch ? idMatch[1] : slug;

      // Avoid duplicates
      if (!stores.find((s) => s.id === id)) {
        stores.push({
          id,
          name,
          type: type.charAt(0).toUpperCase() + type.slice(1),
          city: city
            .replace(/-/g, " ")
            .replace(/\b\w/g, (c) => c.toUpperCase()),
          url: `${ICA_BASE}${href}`,
        });
      }
    }
  });

  return stores;
}

export async function fetchOffers(storeId: string): Promise<SaleItem[]> {
  // Try fetching offers with store context
  const res = await fetch(`${ICA_BASE}/erbjudanden/?butik=${storeId}`, {
    headers: {
      "User-Agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
      Accept: "text/html,application/xhtml+xml",
      Cookie: `SelectedStoreId=${storeId}`,
    },
    next: { revalidate: 3600 }, // cache for 1h
  });

  if (!res.ok) throw new Error(`Failed to fetch offers: ${res.status}`);

  const html = await res.text();
  const items: SaleItem[] = [];

  // Try extracting from __INITIAL_DATA__
  const data = extractInitialData(html);
  if (data) {
    // Navigate the data structure to find offers
    const findOffers = (obj: unknown): unknown[] => {
      if (!obj || typeof obj !== "object") return [];
      const o = obj as Record<string, unknown>;
      if (Array.isArray(o)) {
        for (const item of o) {
          const result = findOffers(item);
          if (result.length > 0) return result;
        }
      }
      // Look for common offer array patterns
      for (const key of [
        "weeklyOffers",
        "offers",
        "items",
        "products",
        "offerList",
      ]) {
        if (Array.isArray(o[key]) && (o[key] as unknown[]).length > 0) {
          return o[key] as unknown[];
        }
      }
      for (const val of Object.values(o)) {
        const result = findOffers(val);
        if (result.length > 0) return result;
      }
      return [];
    };

    const offers = findOffers(data);
    for (const offer of offers) {
      const o = offer as Record<string, unknown>;
      const details = (o.details || o) as Record<string, unknown>;
      const name =
        (details.name as string) ||
        (details.title as string) ||
        (o.name as string) ||
        (o.title as string) ||
        "";
      if (name) {
        items.push({
          name,
          brand: (details.brand as string) || (o.brand as string) || undefined,
          price:
            (details.price as string) ||
            (o.price as string) ||
            (o.currentPrice as string) ||
            undefined,
          comparePrice:
            (details.comparisonPrice as string) ||
            (o.comparisonPrice as string) ||
            undefined,
          category:
            (o.category as string) || (details.category as string) || undefined,
          imageUrl:
            (details.imageUrl as string) ||
            (o.imageUrl as string) ||
            (o.image as string) ||
            undefined,
        });
      }
    }
  }

  // Fallback: parse HTML directly if no __INITIAL_DATA__ offers found
  if (items.length === 0) {
    const $ = cheerio.load(html);
    // Look for offer cards in HTML
    $(
      '[class*="offer"], [class*="product"], [class*="campaign"], [data-testid*="offer"]'
    ).each((_, el) => {
      const name = $(el).find('[class*="name"], [class*="title"], h3, h4').first().text().trim();
      const price = $(el).find('[class*="price"]').first().text().trim();
      const image = $(el).find("img").first().attr("src") || undefined;
      if (name) {
        items.push({ name, price: price || undefined, imageUrl: image });
      }
    });
  }

  return items;
}

export async function fetchRecipes(
  category?: string
): Promise<Recipe[]> {
  const url = category
    ? `${ICA_BASE}/recept/${encodeURIComponent(category)}/`
    : `${ICA_BASE}/recept/`;

  const res = await fetch(url, {
    headers: {
      "User-Agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
      Accept: "text/html,application/xhtml+xml",
    },
    next: { revalidate: 86400 }, // cache for 24h
  });

  if (!res.ok) throw new Error(`Failed to fetch recipes: ${res.status}`);

  const html = await res.text();
  const recipes: Recipe[] = [];

  // Try extracting from __INITIAL_DATA__
  const data = extractInitialData(html);
  if (data) {
    const findRecipes = (obj: unknown): unknown[] => {
      if (!obj || typeof obj !== "object") return [];
      const o = obj as Record<string, unknown>;
      if (Array.isArray(o)) {
        // Check if this looks like a recipe array
        if (
          o.length > 0 &&
          typeof o[0] === "object" &&
          o[0] !== null &&
          ("title" in (o[0] as Record<string, unknown>) ||
            "name" in (o[0] as Record<string, unknown>)) &&
          ("url" in (o[0] as Record<string, unknown>) ||
            "id" in (o[0] as Record<string, unknown>))
        ) {
          return o;
        }
        for (const item of o) {
          const result = findRecipes(item);
          if (result.length > 0) return result;
        }
      }
      for (const key of [
        "recipes",
        "recipeList",
        "items",
        "results",
        "recipeCards",
      ]) {
        if (Array.isArray(o[key]) && (o[key] as unknown[]).length > 0) {
          return o[key] as unknown[];
        }
      }
      for (const val of Object.values(o)) {
        const result = findRecipes(val);
        if (result.length > 0) return result;
      }
      return [];
    };

    const recipeList = findRecipes(data);
    for (const recipe of recipeList) {
      const r = recipe as Record<string, unknown>;
      const title = (r.title as string) || (r.name as string) || "";
      const recipeUrl = (r.url as string) || "";
      const id = String(r.id || recipeUrl.match(/(\d+)\/?$/)?.[1] || "");

      if (title && id) {
        recipes.push({
          id,
          title,
          url: recipeUrl.startsWith("http")
            ? recipeUrl
            : `${ICA_BASE}${recipeUrl}`,
          imageUrl: (r.imageUrl as string) || (r.image as string) || undefined,
          rating: (r.rating as number) || undefined,
          cookingTime:
            (r.cookingTime as string) ||
            (r.totalTime as string) ||
            undefined,
          difficulty: (r.difficulty as string) || undefined,
        });
      }
    }
  }

  // Fallback: parse recipe links from HTML
  if (recipes.length === 0) {
    const $ = cheerio.load(html);
    $('a[href*="/recept/"]').each((_, el) => {
      const href = $(el).attr("href") || "";
      const match = href.match(/\/recept\/([^/]+-(\d+))\/?$/);
      if (match) {
        const title =
          $(el).text().trim() ||
          $(el).find("img").attr("alt") ||
          match[1].replace(/-\d+$/, "").replace(/-/g, " ");
        const id = match[2];
        const image = $(el).find("img").attr("src") || undefined;

        if (!recipes.find((r) => r.id === id)) {
          recipes.push({
            id,
            title: title.replace(/\b\w/g, (c) => c.toUpperCase()),
            url: `${ICA_BASE}${href}`,
            imageUrl: image,
          });
        }
      }
    });
  }

  return recipes;
}
