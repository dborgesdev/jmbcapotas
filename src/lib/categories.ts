import type { Term } from "./wordpress/types";

/** Preorder traversal with alphabetical siblings; retain malformed/orphan terms once. */
export function categoryTree(categories: Term[]) {
  const sorted = [...categories].sort(
    (a, b) => a.name.localeCompare(b.name, "pt-BR") || a.id - b.id,
  );
  const visited = new Set<number>();
  const result: { term: Term; depth: number }[] = [];
  function visit(term: Term, depth: number) {
    if (visited.has(term.id)) return;
    visited.add(term.id);
    result.push({ term, depth });
    for (const child of sorted.filter((c) => c.parent === term.id))
      visit(child, depth + 1);
  }
  for (const term of sorted.filter((c) => !c.parent)) visit(term, 0);
  for (const term of sorted.filter(
    (c) => !categories.some((p) => p.id === c.parent),
  ))
    visit(term, 0);
  for (const term of sorted) visit(term, 0);
  return result;
}
