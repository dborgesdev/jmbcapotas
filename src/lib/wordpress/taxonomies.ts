import { all } from "./client";
import { clean } from "./html";
import { media } from "./media";
import type { Term, Taxonomies } from "./types";
export async function terms(endpoint: string): Promise<Term[]> {
  return Promise.all(
    (await all<Term>(endpoint)).map(async (t) => ({
      ...t,
      name: clean(t.name),
      description: clean(t.description),
      image: await media(t.acf?.logo || t.acf?.imagem),
      background: await media(t.acf?.imagem_fundo),
    })),
  );
}
export async function taxonomies(): Promise<Taxonomies> {
  const [brands, models, categories] = await Promise.all([
    terms("marca"),
    terms("modelo"),
    terms("categoria_produto"),
  ]);
  return { brands, models, categories };
}
