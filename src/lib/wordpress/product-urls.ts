import type { RawPost, Term } from "./types";
type RoutingCategory = Pick<Term, "id" | "slug" | "parent"> & Partial<Term>;
export function fiberCategory(
  ids: number[],
  categories: RoutingCategory[],
): boolean {
  return ids.some((id) => {
    const visited = new Set<number>();
    let term = categories.find((c) => c.id === id);
    while (term && !visited.has(term.id)) {
      if (term.slug === "capota-de-fibra") return true;
      visited.add(term.id);
      term = categories.find((c) => c.id === term?.parent);
    }
    return false;
  });
}
export function productUrl(
  p: Pick<RawPost, "slug" | "categoria_produto" | "modelo">,
  categories: RoutingCategory[],
) {
  return `${fiberCategory(p.categoria_produto || [], categories) && p.modelo?.length ? "/capota-para-picape/" : "/produtos/"}${p.slug}/`;
}
