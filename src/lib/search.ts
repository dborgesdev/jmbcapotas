import type { Search } from "./wordpress/site";
function termId(value: unknown) {
  const id = Number(value);
  return Number.isSafeInteger(id) && id > 0 ? String(id) : undefined;
}
export function validateSearch(s: Record<string, unknown>): Search {
  const page = Number(s.pagina);
  return {
    q:
      typeof s.q === "string" || typeof s.q === "number"
        ? String(s.q).slice(0, 150)
        : undefined,
    categoria: termId(s.categoria),
    marca: termId(s.marca),
    modelo: termId(s.modelo),
    pagina: Number.isSafeInteger(page) && page > 0 ? page : undefined,
    blogCategoria: termId(s.blogCategoria),
  };
}
