import { all } from "./client";
import { clean } from "./html";
import { media, mediaBatch, mediaId } from "./media";
import type { Term, Taxonomies } from "./types";
export async function terms(endpoint: string): Promise<Term[]> {
  const entries = await all<Term>(endpoint);
  const images = await mediaBatch(
    entries.flatMap((t) => [t.acf?.logo || t.acf?.imagem, t.acf?.imagem_fundo]),
  );
  return Promise.all(
    entries.map(async (t) => ({
      id: t.id,
      slug: t.slug,
      count: t.count,
      parent: t.parent,
      acf: t.acf,
      name: clean(t.name),
      description: clean(t.description),
      image: await media(
        t.acf?.logo || t.acf?.imagem,
        images.get(mediaId(t.acf?.logo || t.acf?.imagem)),
      ),
      background: await media(
        t.acf?.imagem_fundo,
        images.get(mediaId(t.acf?.imagem_fundo)),
      ),
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
