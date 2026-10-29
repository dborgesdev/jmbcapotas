import type { Post } from "./types";
type Compatibility = Pick<Post, "id" | "marca" | "modelo">;
export function selectRelatedProducts<T extends Compatibility>(
  current: Compatibility,
  candidates: T[],
  limit = 4,
) {
  if (limit <= 0) return [];
  if (!current.marca?.length || !current.modelo?.length) return [];
  const selected: T[] = [];
  const seen = new Set<number>([current.id]);
  for (const candidate of candidates) {
    if (
      !seen.has(candidate.id) &&
      current.marca.some((id) => candidate.marca?.includes(id)) &&
      current.modelo.some((id) => candidate.modelo?.includes(id))
    ) {
      seen.add(candidate.id);
      selected.push(candidate);
      if (selected.length >= Math.min(4, limit)) break;
    }
  }
  return selected;
}
