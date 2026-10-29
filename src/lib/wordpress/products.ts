import { all } from "./client";
import { collection, type QueryParams } from "./query";
import { normalizePost, postMediaReferences } from "./normalize";
import { mediaBatch } from "./media";
import { productUrl } from "./product-urls";
import type { RawPost, Term, Collection, Post } from "./types";
import { selectRelatedProducts } from "./related";
export const products = (params: QueryParams = {}, categories: Term[] = []) =>
  collection("produto", (p) => productUrl(p, categories), params);
export const productBySlug = async (slug: string, categories: Term[] = []) =>
  (await products({ slug }, categories)).items[0];
export const allProducts = () => all<RawPost>("produto");
export async function readyProducts(
  params: QueryParams,
  categories: Term[],
): Promise<Collection<Post>> {
  // ACF gratuito não oferece filtro REST de meta: a varredura continua exclusivamente no servidor.
  const raw = (
    await all<RawPost>(
      "produto",
      "&" +
        new URLSearchParams(
          Object.entries(params)
            .filter(([key]) => key !== "page")
            .map(([key, value]) => [key, String(value)]),
        ),
    )
  ).filter((p) => p.acf?.pronta_entrega === true);
  const page = Number(params.page) || 1;
  const visible = raw.slice((page - 1) * 12, page * 12);
  const images = await mediaBatch(visible.flatMap(postMediaReferences));
  return {
    items: await Promise.all(
      visible.map((p) => normalizePost(p, productUrl(p, categories), images)),
    ),
    total: raw.length,
    pages: Math.ceil(raw.length / 12),
  };
}
export async function relatedProducts(post: Post, categories: Term[]) {
  if (!post.marca?.length || !post.modelo?.length) return [];
  const compatible = await products(
    {
      marca: post.marca.join(","),
      modelo: post.modelo.join(","),
      tax_relation: "AND",
      exclude: post.id,
      per_page: 4,
    },
    categories,
  ).catch(() => ({ items: [] }));
  return selectRelatedProducts(post, compatible.items);
}
export async function linkedProducts(post: Post, categories: Term[]) {
  return post.acf?.produto?.length
    ? (
        await products(
          { include: post.acf.produto.join(",") },
          categories,
        ).catch(() => ({ items: [], total: 0, pages: 0 }))
      ).items
    : [];
}
