import type { Post } from "./types";
type Compatibility = Pick<Post, "id" | "marca" | "modelo">;
export function selectRelatedProducts<T extends Compatibility>(
  current: Post,
  candidates: T[],
  limit = 4,
) {
  const shares = (a: number[] = [], b: number[] = []) =>
    a.some((id) => b.includes(id));
  const score = (p: Compatibility) => {
    if (shares(current.marca, p.marca) && shares(current.modelo, p.modelo))
      return 0;
    if (
      !p.marca?.length &&
      (!p.modelo?.length || shares(current.modelo, p.modelo))
    )
      return 1;
    return 2;
  };
  return candidates
    .filter(
      (p, index) =>
        p.id !== current.id &&
        candidates.findIndex((other) => other.id === p.id) === index &&
        score(p) < 2,
    )
    .sort((a, b) => score(a) - score(b))
    .slice(0, limit);
}
