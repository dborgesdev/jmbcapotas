import { all } from "./client";
import { productUrl } from "./product-urls";
import { brandUrl, cityUrl } from "../paths";
import type { RawPost, Term } from "./types";

/** Sitemap needs routing metadata, not HTML normalization or attachment resolution. */
export async function sitemapUrls(): Promise<string[]> {
  const [brands, categories, products, pages, cities, posts, works] =
    await Promise.all([
      all<Pick<Term, "id" | "slug">>("marca", "&_fields=id,slug"),
      all<Pick<Term, "id" | "slug" | "parent">>(
        "categoria_produto",
        "&_fields=id,slug,parent",
      ),
      all<Pick<RawPost, "id" | "slug" | "categoria_produto" | "modelo">>(
        "produto",
        "&_fields=id,slug,categoria_produto,modelo",
      ),
      all<Pick<RawPost, "id" | "slug">>("pages", "&_fields=id,slug"),
      all<Pick<RawPost, "id" | "slug">>("cidade", "&_fields=id,slug"),
      all<Pick<RawPost, "id" | "slug">>("posts", "&_fields=id,slug"),
      all<Pick<RawPost, "id" | "slug">>("trabalho", "&_fields=id,slug"),
    ]);
  return [
    "/",
    "/produtos/",
    "/pronta-entrega/",
    "/trabalhos/",
    "/blog/",
    "/cidades/",
    ...brands.map(brandUrl),
    ...categories.map((c) => `/produtos/${c.slug}/`),
    ...products.map((p) => productUrl(p, categories)),
    ...pages.map((p) => `/${p.slug}/`),
    ...cities.map((p) => cityUrl(p.slug)),
    ...posts.map((p) => `/blog/${p.slug}/`),
    ...works.map((p) => `/trabalhos/${p.slug}/`),
  ];
}
