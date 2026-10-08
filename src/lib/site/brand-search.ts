import type { Search } from "./types";
import type { Taxonomies } from "../wordpress/types";
export function brandSearch(
  search: Search,
  brand: string,
  tax: Taxonomies,
): Search {
  return {
    q: search.q || undefined,
    categoria: tax.categories.some((c) => String(c.id) === search.categoria)
      ? search.categoria
      : undefined,
    modelo: tax.models.some(
      (m) => String(m.id) === search.modelo && String(m.acf?.marca) === brand,
    )
      ? search.modelo
      : undefined,
  };
}
