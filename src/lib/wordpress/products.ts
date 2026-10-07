import { all } from "./client";
import { collection, type QueryParams } from "./query";
import { normalizePost } from "./normalize";
import { productUrl } from "./product-urls";
import type { RawPost, Term, Collection, Post } from "./types";
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
  return {
    items: await Promise.all(
      raw
        .slice((page - 1) * 12, page * 12)
        .map((p) => normalizePost(p, productUrl(p, categories))),
    ),
    total: raw.length,
    pages: Math.ceil(raw.length / 12),
  };
}
export async function relatedProducts(post: Post, categories: Term[]) {
  const related = await products(
    post.categoria_produto?.[0]
      ? { categoria_produto: post.categoria_produto[0], per_page: 5 }
      : { per_page: 5 },
    categories,
  ).catch(() => ({ items: [], total: 0, pages: 0 }));
  return related.items.filter((p) => p.id !== post.id).slice(0, 4);
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
